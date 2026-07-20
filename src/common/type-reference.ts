export interface TypeReference {
    $tsType: string
    $fileName: string
    $position: [number, number]
    $isExpr?: boolean
}

export function isTypeReference(obj: any): obj is TypeReference {
    return obj && '$tsType' in obj && '$fileName' in obj
}
