export const safeCall = (callable) => {
    return (...args) => {
        try {
            callable(...args)
        } catch (e) {
            console.error(e)
        }
    }
}