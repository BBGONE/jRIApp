/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IIndexer } from "../int";

export interface IArrayLikeList<T> {
    length: number;
    [index: number]: T;
}

export class ArrayHelper {
    public static clone<T>(arr: T[]): T[] {
        if (arr.length === 1) {
            return [arr[0]];
        }
        else {
            return Array.apply(null, arr);
        }
    }

    public static fromList<T extends U, U>(list: IArrayLikeList<U>): T[];
    public static fromList<T>(list: IArrayLikeList<any>): T[];
    public static fromList<T>(list: IArrayLikeList<T>): T[];

    public static fromList(list: IArrayLikeList<any>): any[] {
        return [].slice.call(list);
    }

    public static distinct(arr: string[]): string[];
    public static distinct(arr: number[]): number[];

    public static distinct(arr: any[]): any[] {
        let o = <IIndexer<any>>{}, i: number, l = arr.length, r: any[] = [];
        for (i = 0; i < l; i += 1)
            o["" + arr[i]] = arr[i];
        let k = Object.keys(o);
        for (i = 0, l = k.length; i < l; i += 1)
            r.push(o[k[i]]);
        return r;
    }
    public static remove(array: any[], obj: any): number {
        const i = array.indexOf(obj);
        if (i > -1) {
            array.splice(i, 1);
        }
        return i;
    }
    public static removeIndex(array: any[], index: number): boolean {
        const isOk = index > -1 && array.length > index;
        array.splice(index, 1);
        return isOk;
    }
    public static insert(array: any[], obj: any, pos: number): void {
        array.splice(pos, 0, obj);
    }
}