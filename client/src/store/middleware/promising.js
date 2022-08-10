export const promising = ({ dispatch }) => next => action => {
  // Handle actions as promises
  if (action instanceof Promise) {
    return action.then(dispatch)
  }

  // Handle actions _with_ promises
  if (action.promise instanceof Promise) {
    // Pluck off the promise and the type
    const {
      promise,
      type,
      ...rest
    } = action

    // Dispatch processing, success, and/or failure actions, depending on the promise.
    dispatch({
      ...rest,
      type: `${type}.processing`
    })
    return promise
      .then(success => dispatch({
        ...rest,
        type: `${type}.success`,
        response: success
      }))
      .catch(err => dispatch({
        ...rest,
        type: `${type}.failure`,
        response: err
      }))
  }

  // Handle normal actions
  return next(action)
}
