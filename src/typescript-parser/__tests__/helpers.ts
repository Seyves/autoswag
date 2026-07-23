import ts from 'typescript'

export function createProgram(files: string[]) {
    return ts.createProgram(files, {
        moduleDetection: ts.ModuleDetectionKind.Force,
        target: ts.ScriptTarget.ESNext,
        allowJs: true,
        checkJs: true,
    })
}
