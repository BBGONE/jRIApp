define("jriapp_ru", ["require", "exports", "jriapp_shared/lang", "jriapp/bootstrap"], function (require, exports, lang_1, bootstrap_1) {
    "use strict";
    var PAGER = {
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
    var VALIDATE = {
        errorInfo: "Ошибки:",
        errorField: "поле:"
    };
    var TEXT = {
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
    var _STRS = { PAGER: PAGER, VALIDATE: VALIDATE, TEXT: TEXT };
    lang_1.assign(lang_1.STRS, _STRS);
    bootstrap_1.bootstrap.addOnInitialize(function (boot, args) {
        var datepicker = boot.getSvc("IDatepicker");
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
});
