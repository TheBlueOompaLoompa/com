export type Message = {
    role: string,
    content: string,
    context: number[] | undefined
}