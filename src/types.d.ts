declare module 'html-to-draftjs' {
  export default function htmlToDraft(html: string): {
    contentBlocks: any[]
    entityMap: any
  }
}

declare module 'draftjs-to-html' {
  export default function draftToHtml(contentState: any): string
}
