import { Category, Font, FontManager, Script, SortOption, Variant } from "@samuelmeuli/font-manager";
import React, { KeyboardEvent, PureComponent, ReactElement } from "react";
declare type LoadingStatus = "loading" | "finished" | "error";
interface Props {
    apiKey: string;
    activeFontFamily: string;
    onChange: (font: Font) => void;
    pickerId: string;
    families: string[];
    categories: Category[];
    scripts: Script[];
    variants: Variant[];
    filter: (font: Font) => boolean;
    limit: number;
    sort: SortOption;
    setActiveFontCallback: ()=>void;
}
interface State {
    expanded: boolean;
    loadingStatus: LoadingStatus;
}
export default class FontPicker extends PureComponent<Props, State> {
    fontManager: FontManager;
    static defaultProps: {
        activeFontFamily: string;
        onChange: () => void;
        pickerId: string;
        families: string[];
        categories: Category[];
        scripts: Script[];
        variants: Variant[];
        filter: (font: Font) => boolean;
        limit: number;
        sort: SortOption;
    };
    state: Readonly<State>;
    constructor(props: Props);
    componentDidUpdate(prevProps: Props): void;
    onClose(e: MouseEvent): void;
    onSelection(e: React.MouseEvent | KeyboardEvent): void;
    onFontSelect(font:string): void;
    setActiveFontFamily(activeFontFamily: string): void;
    generateFontList(fonts: Font[]): ReactElement;
    toggleExpanded(): void;
    render(): ReactElement;
}
export {};
//# sourceMappingURL=FontPicker.d.ts.map