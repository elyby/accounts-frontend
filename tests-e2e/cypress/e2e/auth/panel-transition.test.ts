/**
 * This test should help somebody in the future, who would try to refactor the PanelTransition
 */

interface BodyGeometry {
    active: boolean;
    // All coordinates are relative to the top edge of the panel's body (the bottom edge of the header)
    top: number;
    bottom: number;
    contentTop: number;
    errorTop: number | null;
    errorBottom: number | null;
}

interface Frame {
    time: number;
    dt: number;
    clipHeight: number;
    /**
     * The height of the outer clipping container. On the context change it collapses the whole panel's body,
     * so the content's movement is invisible while it's collapsed
     */
    visibleHeight: number;
    bodies: Array<BodyGeometry>;
}

const SUB_PIXEL = 0.5;
// While the panel's body is collapsed to a few pixels, the content's movement can't be seen
const MIN_VISIBLE_HEIGHT = 5;

function getActive(frame: Frame): BodyGeometry {
    const body = frame.bodies.find((item) => item.active);
    expect(body, `active body at ${frame.time}ms`).to.exist;

    return body!;
}

function snapshot(doc: Document, time: number, dt: number): Frame {
    const bodies = Array.from(doc.querySelectorAll<HTMLElement>('[data-testid=auth-body]'));
    // The bodies are positioned inside the container, which height is animated
    const clip = bodies[0].parentElement!;
    const panelBodyTop = clip.parentElement!.getBoundingClientRect().top;
    let outerClip = clip.parentElement!.parentElement;

    while (outerClip && getComputedStyle(outerClip).overflow !== 'hidden') {
        outerClip = outerClip.parentElement;
    }

    return {
        time,
        dt,
        clipHeight: clip.getBoundingClientRect().height,
        visibleHeight: outerClip ? outerClip.getBoundingClientRect().height : Infinity,
        bodies: bodies.map((body) => {
            const rect = body.getBoundingClientRect();
            const error = body.querySelector('[data-testid=auth-error]');
            const errorRect = error?.getBoundingClientRect();
            const content = body.querySelector('fieldset')!.getBoundingClientRect();

            return {
                active: body.dataset.e2ePanelActive === 'true',
                top: rect.top - panelBodyTop,
                bottom: rect.bottom - panelBodyTop,
                contentTop: content.top - panelBodyTop,
                errorTop: errorRect ? errorRect.top - panelBodyTop : null,
                errorBottom: errorRect ? errorRect.bottom - panelBodyTop : null,
            };
        }),
    };
}

/**
 * Performs the action on the next animation frame and records the panel's geometry on each frame for the duration
 */
function recordFrames(action: (doc: Document) => void, duration = 1500): Cypress.Chainable<Array<Frame>> {
    return cy.window({ log: false }).then(
        { timeout: duration + 5000 },
        (win) =>
            new Cypress.Promise<Array<Frame>>((resolve) => {
                const frames: Array<Frame> = [];
                let start: number | null = null;
                let prev = 0;

                const tick = (now: number) => {
                    if (start === null) {
                        start = now;
                        prev = now;
                        action(win.document);
                    }

                    frames.push(snapshot(win.document, Math.round(now - start), now - prev));
                    prev = now;

                    if (now - start < duration) {
                        win.requestAnimationFrame(tick);
                    } else {
                        resolve(frames);
                    }
                };

                win.requestAnimationFrame(tick);
            }),
    );
}

/**
 * The panel's movement is driven by springs, so its speed changes gradually from frame to frame. An instant
 * jump (e.g. the content shifted by the error's height in one frame) is a step, which is much bigger than
 * the neighbouring ones. The comparison is done by the speed, since the frames' durations may differ
 */
const MIN_JUMP = 8;
// A stiff spring reaches its top speed within the first frame and then slows down, so the first step
// may be ~3 times bigger than the next one. A real jump exceeds the neighbouring steps by an order of magnitude
const JUMP_SPEED_RATIO = 4;

function assertNoJumps(frames: Array<Frame>, pick: (frame: Frame) => number | null, what: string) {
    const steps: Array<{ time: number; distance: number; speed: number } | null> = [];

    for (let i = 1; i < frames.length; i++) {
        const prev = pick(frames[i - 1]);
        const curr = pick(frames[i]);
        const isVisible = Math.min(frames[i - 1].visibleHeight, frames[i].visibleHeight) >= MIN_VISIBLE_HEIGHT;

        if (prev === null || curr === null || !isVisible) {
            steps.push(null);
            continue;
        }

        const distance = Math.abs(curr - prev);
        steps.push({ time: frames[i].time, distance, speed: distance / frames[i].dt });
    }

    steps.forEach((step, i) => {
        if (!step || step.distance < MIN_JUMP) {
            return;
        }

        const neighbours = [steps[i - 1], steps[i + 1]].filter(Boolean).map((item) => item!.speed);
        const neighboursSpeed = Math.max(0, ...neighbours);

        expect(step.speed, `${what} moves smoothly at ${step.time}ms (${step.distance.toFixed(1)}px)`).to.be.at.most(
            neighboursSpeed * JUMP_SPEED_RATIO,
        );
    });
}

/**
 * At rest the clipping container fits the active body exactly: nothing is cut and there is no empty space
 */
function assertAtRest(frame: Frame) {
    expect(frame.bodies, 'only the active panel is left').to.have.length(1);

    const body = getActive(frame);
    expect(body.top, 'body is at the top edge').to.be.closeTo(0, SUB_PIXEL);
    expect(body.bottom, 'body fits the clipping container').to.be.closeTo(frame.clipHeight, SUB_PIXEL);

    if (body.errorTop !== null) {
        expect(body.errorTop, 'error is right under the header').to.be.closeTo(0, SUB_PIXEL);
    }
}

/**
 * While the error is displayed, it must stick to the header (never leave a gap under it) and move together
 * with the form as a single whole
 */
function assertErrorMovesWithForm(frames: Array<Frame>) {
    const withError = frames.map(getActive).filter((body) => body.errorTop !== null);
    expect(withError, 'frames with the error').not.to.be.empty;

    const distance = withError[0].contentTop - withError[0].errorTop!;

    withError.forEach((body, i) => {
        expect(body.errorTop!, `error doesn't leave a gap under the header (frame ${i})`).to.be.at.most(SUB_PIXEL);
        expect(body.contentTop - body.errorTop!, `error and form move together (frame ${i})`).to.be.closeTo(
            distance,
            SUB_PIXEL,
        );
    });

    frames.forEach((frame) => {
        const body = getActive(frame);
        expect(body.bottom, `form isn't cut at ${frame.time}ms`).to.be.at.most(frame.clipHeight + SUB_PIXEL);
    });
}

const submit = (doc: Document) => doc.querySelector<HTMLButtonElement>('form [type=submit]')!.click();
const closeError = (doc: Document) =>
    doc.querySelector<HTMLElement>('[data-testid=auth-body][data-e2e-panel-active=true] [data-testid=auth-error] span')!.click();
const clickSecondaryLink = (index: number) => (doc: Document) =>
    doc.querySelectorAll<HTMLElement>('[data-testid=auth-controls-secondary][data-e2e-panel-active=true] a')[index].click();
const goBack = (doc: Document) =>
    doc.querySelector<HTMLElement>('[data-testid=auth-header][data-e2e-panel-active=true] [data-e2e-go-back]')!.click();

const last = <T>(items: Array<T>): T => items[items.length - 1];

/**
 * Shows the error by submitting the empty form, which is invalid on the any step with a required field
 */
function showError() {
    return recordFrames(submit).then((frames) => {
        const firstWithError = frames.map(getActive).find((body) => body.errorTop !== null);
        expect(firstWithError, 'error appears').to.exist;
        expect(firstWithError!.errorBottom!, 'error is hidden above the edge when rendered').to.be.at.most(SUB_PIXEL);

        assertErrorMovesWithForm(frames);
        assertNoJumps(frames, (frame) => getActive(frame).contentTop, 'form');
        assertAtRest(last(frames));
    });
}

function hideError() {
    return recordFrames(closeError).then((frames) => {
        expect(getActive(frames[1]).errorTop, 'error is still displayed while the panel collapses').not.to.be.null;

        assertErrorMovesWithForm(frames.filter((frame) => getActive(frame).errorTop !== null));
        assertNoJumps(frames, (frame) => getActive(frame).contentTop, 'form');
        expect(getActive(last(frames)).errorTop, 'error is removed in the end').to.be.null;
        assertAtRest(last(frames));
    });
}

/**
 * During the transition both panels are visible. Each of them must move smoothly and the leaving one
 * must keep the error, which it displayed at the moment of the panel change
 */
function assertTransition(frames: Array<Frame>, label: string, { leavingHasError }: { leavingHasError: boolean }) {
    const transitionFrames = frames.filter((frame) => frame.bodies.length > 1);
    expect(transitionFrames, 'both panels are rendered during the transition').not.to.be.empty;

    transitionFrames.forEach((frame) => {
        const leaving = frame.bodies.find((body) => !body.active)!;
        expect(leaving.errorTop !== null, `leaving panel keeps its error at ${frame.time}ms`).to.eq(leavingHasError);
        expect(getActive(frame).errorTop, `entering panel has no error at ${frame.time}ms`).to.be.null;
    });

    assertNoJumps(transitionFrames, (frame) => getActive(frame).contentTop, `${label}: entering panel`);
    assertNoJumps(
        transitionFrames,
        (frame) => frame.bodies.find((body) => !body.active)!.contentTop,
        `${label}: leaving panel`,
    );
    assertAtRest(last(frames));
}

function visitPanel(path: string) {
    cy.visit(path);
    cy.get('[data-testid=auth-body]').should('have.length', 1);
    // Let the initial measurements and the captcha's loading settle
    cy.wait(1500);
}

describe('Panel transition', () => {
    beforeEach(() => {
        visitPanel('/login');
    });

    it('should slide the error in and out together with the form', () => {
        showError();
        hideError();
    });

    it('should bring the error back when it appears again while being hidden', () => {
        showError();

        recordFrames((doc) => {
            closeError(doc);
            setTimeout(() => submit(doc), 80);
        }).then((frames) => {
            assertErrorMovesWithForm(frames);
            expect(getActive(last(frames)).errorTop, 'error is displayed').not.to.be.null;
            assertAtRest(last(frames));
        });
    });

    it('should adapt to the form height changes', () => {
        const extraHeight = 60;
        let initialContentTop = 0;

        recordFrames((doc) => {
            const filler = doc.createElement('div');
            filler.id = 'e2e-filler';
            filler.style.height = `${extraHeight}px`;
            doc.querySelector('[data-testid=auth-body][data-e2e-panel-active=true] fieldset')!.appendChild(filler);
        }).then((frames) => {
            initialContentTop = getActive(frames[0]).contentTop;

            // The content grows at the bottom, so it's revealed downwards and the form itself stays in place
            frames.forEach((frame) => {
                expect(getActive(frame).contentTop, `form stays in place at ${frame.time}ms`).to.be.closeTo(
                    initialContentTop,
                    SUB_PIXEL,
                );
            });
            assertNoJumps(frames, (frame) => frame.clipHeight, 'panel height');
            expect(last(frames).clipHeight - frames[0].clipHeight, 'panel grows').to.be.closeTo(extraHeight, SUB_PIXEL);
            assertAtRest(last(frames));
        });

        recordFrames((doc) => doc.getElementById('e2e-filler')!.remove()).then((frames) => {
            assertNoJumps(frames, (frame) => frame.clipHeight, 'panel height');
            assertAtRest(last(frames));
        });
    });

    it('should keep the leaving panel displayed on the context change (Y axis)', () => {
        recordFrames((doc) => doc.querySelector<HTMLElement>('a[href="/register"]')!.click()).then((frames) => {
            assertTransition(frames, 'login → register', { leavingHasError: false });
        });
    });

    it('should keep the leaving panel displayed on the context change back (Y axis)', () => {
        visitPanel('/register');

        recordFrames((doc) => doc.querySelector<HTMLElement>('a[href="/login"]')!.click()).then((frames) => {
            assertTransition(frames, 'register → login', { leavingHasError: false });
        });
    });

    it('should keep the error on the leaving panel on the context change (Y axis)', () => {
        showError();

        recordFrames((doc) => doc.querySelector<HTMLElement>('a[href="/register"]')!.click()).then((frames) => {
            assertTransition(frames, 'login with error → register', { leavingHasError: true });
        });
    });

    it('should keep the leaving panel displayed on the panel change within the context (X axis)', () => {
        visitPanel('/register');

        // To the right and back
        recordFrames(clickSecondaryLink(0)).then((frames) => {
            assertTransition(frames, 'register → resend activation', { leavingHasError: false });
        });

        showError();

        recordFrames(goBack).then((frames) => {
            assertTransition(frames, 'resend activation with error → register', { leavingHasError: true });
        });
    });
});
