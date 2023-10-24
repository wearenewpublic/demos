import { StyleSheet, Text } from "react-native";
import { TranslatableText, useTranslation } from "../component/translation"
import { colorTextGrey } from "./color";


export function ContentHeading({level=3, text, label, formatParams}) {
    const s = TextStyle;
    const sizes = {
        1: 48,
        2: 32,
        3: 24,
        4: 20,
        5: 16,
    }
    const size = sizes[level] ?? 16;

    return <TranslatableText text={text} label={label} formatParams={formatParams}
        style={[s.contentHeading, {fontSize: size, lineHeight: size * 1.25}]} />
}

const ContentHeadingStyle = StyleSheet.create({
    heading: {
        fontFamily: 'Raleway_400Regular'
    }
})

export function Heading({text, label, formatParams}) {
    return <TranslatableText text={text} label={label} formatParams={formatParams} 
        style={TextStyle.heading} />
}

export function Paragraph({sizeType='small', text, label, formatParams}) {
    const s = TextStyle;
    const styleMap = {
        large: s.largeParagraph,
        small: s.smallParagraph
    }
    return <TranslatableText text={text} label={label} formatParams={formatParams} 
        style={styleMap[sizeType]} 
    />
}

export function UtilityText({sizeType='small', text, label, formatParams}) {
    const s = TextStyle;
    const styleMap = {
        large: s.utilityLarge,
        small: s.utilitySmall,
        bold: s.utilityBold,
        faint: s.utilityFaint,
        tiny: s.utilityTiny,
        tinycaps: s.utilityTinyCaps,
    }
    return <TranslatableText text={text} label={label} formatParams={formatParams}
        style={styleMap[sizeType]} />
}

const TextStyle = StyleSheet.create({
    utilityLarge: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 16,
        lineHeight: 16 * 1.25
    },
    utilitySmall: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 14, 
        lineHeight: 14 * 1.25
    },
    utilityBold: {
        fontFamily: 'IBMPlexMono_500Medium',
        fontSize: 14,
        lineHeight: 14 * 1.25
    },
    utilityFaint: {
        fontFamily: 'IBMPlexMono_500Medium',
        fontSize: 14,
        lineHeight: 14 * 1.25,
        color: colorTextGrey
    },
    utilityTinyCaps: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 12,
        lineHeight: 12 * 1.25,
        textTransform: 'uppercase'
    },
    utilityTiny: {
        fontFamily: 'IBMPlexMono_400Regular',
        fontSize: 12,
        lineHeight: 12 * 1.25,
    },
    contentHeading: {
        fontFamily: 'Raleway_400Regular'
    },
    heading: {
        fontFamily: 'IBMPlexMono_600SemiBold',
        fontSize: 16,
        lineHeight: 16 * 1.25
    },
    largeParagraph: {
        fontSize: 16,
        lineHeight: 16 * 1.5,
        fontFamily: 'IBMPlexMono_400Regular',
    },
    smallParagraph: {
        fontSize: 14,
        lineHeight: 14 * 1.5,
        fontFamily: 'IBMPlexMono_400Regular',
    }
})