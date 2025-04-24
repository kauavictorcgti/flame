import { escapeRegex } from "./escapeRegex";


export const regexSearch = (search: string, text: string) => {

    const query = search.trim().replace(/%20/, ' ');
    return new RegExp(escapeRegex(query), 'i').test(text)

}