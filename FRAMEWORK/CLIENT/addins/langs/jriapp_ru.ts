/// <reference path="../../built/jriapp.d.ts" />
/// <reference path="../../thirdparty/jquery.d.ts" />
/// <reference path="../../thirdparty/jqueryui.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IPagerText, IValidateText, IText, ILocaleText, STRS, assign } from "jriapp_shared/lang";
import { bootstrap } from "jriapp/bootstrap";
import { IDatepicker } from "jriapp/int";

let PAGER: IPagerText = {
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

let VALIDATE: IValidateText = {
    errorInfo: "Ошибки:",
    errorField: "поле:"
};

let TEXT: IText = {
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

let _STRS: ILocaleText = { PAGER: PAGER, VALIDATE: VALIDATE, TEXT: TEXT };

assign(STRS, _STRS);

bootstrap.addOnInitialize((boot, args) => {
    let datepicker = boot.getSvc<IDatepicker>("IDatepicker");
    if (!datepicker)
        throw new Error("IDatepicker service is not registered");

    $.datepicker.regional["ru"] = {
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
    datepicker.datepickerRegion = "ru";
});