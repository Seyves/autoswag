export type Result = Success | Error
type Success = { status: 'success'; data: string }
type Error = { status: 'error'; message: string }
