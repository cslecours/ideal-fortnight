import { map, type Observable } from "rxjs"
import { parseXml } from "../xml/parseXml"

export function xmlStream(message$: Observable<string>): Observable<Element> {
  return message$.pipe(map(parseXml))
}
