import { useContext } from "react";
import { ui_translations_french } from "../translations/french/ui_french";
import { ui_translations_german } from "../translations/german/ui_german";
import { PrototypeContext } from "../organizer/PrototypeContext";
import { Text } from "react-native";
import { formatString } from "../util/util";

export const languageEnglish = 'english';
export const languageGerman = 'german';
export const languageFrench = 'french';

const ui_translations_for_language = {
    german: ui_translations_german,
    french: ui_translations_french
}

export function translateLabel({label, language, formatParams}) {
    const translations = ui_translations_for_language[language];
    var translatedText = translations ? translations[label] : label;

    if (!translatedText && language != languageEnglish && language) {
        console.log('No translation for ' + label + ' in ' + language);
    }
    if (formatParams) {
        translatedText = formatString(translatedText || label, formatParams);
    }
    return translatedText || label;
}

export function useLanguage() {
    const {instance} = useContext(PrototypeContext);
    return instance?.language;
}

export function useTranslation(label, formatParams) {
    const {instance} = useContext(PrototypeContext);
    const language = instance?.language;
    return translateLabel({label, language, formatParams});
}

export function TranslatableLabel({label, formatParams, style, ...props}) {
    try {
        const translatedLabel = useTranslation(label, formatParams);
        return <Text style={style} {...props}>{translatedLabel || label}</Text>
    } catch (e) {
        console.log('Error translating ' + label, e);
        throw Error('Error translating ' + label + ': ' + e);
        // return <Text style={style} {...props}>{label}</Text>
    }
}



