# How to add new auth panel

To add new panel you need to:

* add new state to `services/authFlow` and coresponding test to `tests/services/authFlow`
* connect state to `authFlow`. Update `services/authFlow/AuthFlow.test` and `services/authFlow/AuthFlow.functional.test` (the last one for some complex flow)
* add new actions to `components/auth/actions` and api endpoints to `services/api`
* create panel component at `components/auth/[panelId]`
* add new context in `components/auth/PanelTransition`
* connect component to `routes`
* whatever else you need

Commit id with example: f4d315c

# TODO

This flow must be simplified
