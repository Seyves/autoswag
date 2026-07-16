export interface TypeReference {
    $tsType: string
    $fileName: string
}

export function isTypeReference(obj: any): obj is TypeReference {
    return obj && '$tsType' in obj && '$fileName' in obj
}
