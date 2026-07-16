// This file has no @autodoc tags, should return empty paths

interface User {
    id: string
    name: string
}

/**
 * Regular JSDoc comment
 * @param id User ID
 * @returns User object
 */
function getUser(id: string): User {
    return { id, name: 'Test' }
}
