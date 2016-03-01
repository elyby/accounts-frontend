export default class AbstractState {
    resolve() {}
    goBack() {
        throw new Error('There is no way back');
    }
    reject() {}
    enter() {}
    leave() {}
}
