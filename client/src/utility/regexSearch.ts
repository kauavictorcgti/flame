import { escapeRegex } from "./escapeRegex";


export const regexSearch = (search: string, text: string) => {

    const searchTerms = search.trim().split(/%20/);

    console.log(search)
    console.log(searchTerms)
    console.log(text)

    return searchTerms.every(term => new RegExp(escapeRegex(term), 'i').test(text))

}