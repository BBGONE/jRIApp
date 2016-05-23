/// <reference path="../../built/jriapp.d.ts" />
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
import * as langMOD from "jriapp_core/lang";
import { bootstrap } from "jriapp_core/bootstrap";
import { Utils as utils } from "jriapp_utils/utils";

let PAGER: langMOD.IPagerText = {
    firstText: "<<",
    lastText: ">>",
    previousText: "<",
    nextText: ">",
    pageInfo: "Страница {0} из {1}",
    firstPageTip: "на 1 страницу",
    prevPageTip: "назад на {0}",
    nextPageTip: "вперед на {0}",
    lastPageTip: "последняя страница",
    showingTip: "записи от {0} до {1} из {2}",
    showTip: "показать записи от {0} до {1} из {2}"
};

let VALIDATE: langMOD.IValidateText = {
    errorInfo: "Ошибки:",
    errorField: "поле:"
};

let TEXT: langMOD.IText = {
    txtEdit: "Редактировать",
    txtAddNew: "Добавить",
    txtDelete: "Удалить",
    txtCancel: "Отмена",
    txtOk: "ОК",
    txtRefresh: "Обновить",
    txtAskDelete: "Вы уверены, что хотите удалить запись?",
    txtSubmitting: "Сохранение данных ...",
    txtSave: "Сохранить",
    txtClose: "Закрыть",
    txtField: "Поле"
};

let _STRS: langMOD.ILocaleText = { PAGER: PAGER, VALIDATE: VALIDATE, TEXT: TEXT };

langMOD.assign(langMOD.STRS, _STRS);

bootstrap.addOnInitialize((bootstrap, args) => {
    (<any>utils.dom.$).datepicker.regional["ru"] = {
        closeText: "Закрыть",
        prevText: "&#x3c;Пред",
        nextText: "След&#x3e;",
        currentText: "Сегодня",
        monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн",
            "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        dayNames: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
        dayNamesShort: ["вск", "пнд", "втр", "срд", "чтв", "птн", "сбт"],
        dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        dateFormat: "dd.mm.yy",
        firstDay: 1,
        isRTL: false
   };
    bootstrap.defaults.datepicker.datepickerRegion = "ru";
});
export const moduleKey = "ru";
