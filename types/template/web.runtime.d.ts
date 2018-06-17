declare const maskId: string;
declare const rootId = "card-root";
declare let styleAdded: boolean;
declare function addLayer(background: string | undefined, opacity: number | string | undefined): void;
declare function removeLayer(): void;
declare function addLayerCss(background: any, opacity: any): void;
declare function getLayerStyle(background: string, opacity: number | string): string;
declare function transformColorToRgba(color: string, opacity: number | string): string;
