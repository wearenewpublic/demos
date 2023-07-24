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

export function translateText({text, language, formatParams}) {
    const translations = ui_translations_for_language[language];
    var translatedText = translations ? translations[text] : text;

    if (!translatedText && language != languageEnglish && language) {
        console.log('No translation for ' + text + ' in ' + language);
    }
    if (formatParams) {
        translatedText = formatString(translatedText || text, formatParams);
    }
    return translatedText || text;
}

export function useLanguage() {
    const {instance} = useContext(PrototypeContext);
    return instance?.language;
}

export function useTranslation(text, formatParams) {
    const {instance} = useContext(PrototypeContext);
    const language = instance?.language;
    return translateText({text, language, formatParams});
}

export function TranslatableText({text, formatParams, style, ...props}) {
    const translatedText = useTranslation(text, formatParams);
    return <Text style={style} {...props}>{translatedText || text}</Text>
}



