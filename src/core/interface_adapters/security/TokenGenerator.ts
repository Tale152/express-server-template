export default interface TokenGenerator {

    generate: (str: string) => string

    decode: (token: string) => string | undefined

}
