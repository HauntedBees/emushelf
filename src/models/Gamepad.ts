export interface InputOpen {
    open: boolean;
    el: HTMLInputElement|HTMLTextAreaElement|null;
    value: string;
    label?: string;
    editCallback?: (s: string) => void;
    closeCallback?: (s: string) => void; 
}