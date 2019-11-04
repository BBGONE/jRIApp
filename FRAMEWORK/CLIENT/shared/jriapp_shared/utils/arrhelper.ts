/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IIndexer } from "../int";
import { CoreUtils } from "./coreutils";

const { toArray, Indexer } = CoreUtils;
 
export interface IArrayLikeList<T> {
    length: number;
    [index: number]: T;
}

export class ArrayHelper {
    public static clone<T>(arr: T[]): T[] {
        if (arr.length === 1) {
            return [arr[0]];
        } else {
            return Array.apply(null, arr);
        }
    }

    public static fromList<T extends U, U>(list: IArrayLikeList<U>): T[];
    public static fromList<T>(list: IArrayLikeList<any>): T[];
    public static fromList<T>(list: IArrayLikeList<T>): T[];
    public static fromList(list: IArrayLikeList<any>): any[] {
        if (!list)
            return [];
        return [].slice.call(list);
    }
    public static merge<T>(arrays: Array<Array<T>>): Array<T> {
        if (!arrays)
            return [];
        return [].concat.apply([], arrays);
    }

    public static distinct(arr: string[]): string[];
    public static distinct(arr: number[]): number[];
    public static distinct(arr: any[]): any[] {
        if (!arr)
            return [];
        const map = Indexer(), len = arr.length;
        for (let i = 0; i < len; i += 1) {
            map["" + arr[i]] = arr[i];
        }
        return toArray(map);
    }
    public static toMap<T extends object>(arr: T[], key: (obj: T) => string): IIndexer<T> {
        const map = Indexer();
        if (!arr)
            return map;
        const len = arr.length;
        for (let i = 0; i < len; i += 1) {
            map[key(arr[i])] = arr[i];
        }
        return map;
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
