/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { IIndexer } from "../jriapp_core/shared";

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
        let i = array.indexOf(obj);
        if (i > -1) {
            array.splice(i, 1);
        }
        return i;
    }
    public static insert(array: any[], obj: any, pos: number): void {
        array.splice(pos, 0, obj);
    }
}