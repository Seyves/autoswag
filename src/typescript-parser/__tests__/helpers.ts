import ts from 'typescript'

export function createProgram(files: string[]) {
    return ts.createProgram(files, {
        moduleDetection: ts.ModuleDetectionKind.Force,
        allowJs: true,
        checkJs: true,
        target: ts.ScriptTarget.ESNext,
    })
}
