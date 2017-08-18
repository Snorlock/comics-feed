import interactiveHandlerImpl from './interactiveHandler'
import subscriptionHandlerImpl from './subscriptionConfigHandler'
import whoHandlerImpl from './whoHandler'
export const interactiveHandler = (body, res) => {
    switch (body.callback_id) {
        case 'subscription':
            interactiveHandlerImpl(body, res);
            break;
        default:

    }
}


export const subscriptionHandler = (body, res) => {

}
export const whoHandler = (res) => {
  whoHandlerImpl(res)
}
