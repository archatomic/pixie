const errorMessage = (message, args) =>
{
    if (!message) return 'An invariant violation occured'
    let i = 0
    return message.replace(/%s/g, () => args[i++])
}

export const invariant = (condition, message, ...args) =>
{
    if (condition) return

    const error = new Error(errorMessage(message, args))
    error.name = 'Invariant Violation'
    throw error
}
