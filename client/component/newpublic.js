import { StyleSheet, Text, View } from "react-native";
import { Narrow } from "./basics";

export const colorNewPublicBackground = '#FCC8A6';
export const colorNewPublicText = '#5B1DF3';
export const colorNewPublicBody = '#CEE0FF';


export function NewPublicName({children}) {
    const s = NewPublicTitleStyle;
    return <Text style={s.name}>{children}</Text>
}

export function NewPublicTitle({children}) {
    const s = NewPublicTitleStyle;
    return <Text style={s.title}>{children}</Text>
}

const NewPublicTitleStyle = StyleSheet.create({
    name: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        lineHeight: 18,
        color: colorNewPublicText
    },
    title: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 36,
        lineHeight: 36,
        color: colorNewPublicText
    }
});

export function NewPublicTitleBanner({children}) {
    const s = NewPublicTitleBannerStyle;
    return <View style={s.banner}>
        <Narrow>
            <View style={{flex: 1, marginHorizontal: 10}}>
            {children}
            </View>
        </Narrow>
    </View>
}

const NewPublicTitleBannerStyle = StyleSheet.create({
    banner: {
        width: '100%',
        paddingBottom: 0,
        paddingTop: 0,
        backgroundColor: colorNewPublicBackground
    }
});

export function NewPublicBodySection({children}) {
    const s = NewPublicBodySectionStyle;
    return <View style={s.section}>
        {children}
    </View>
}

const NewPublicBodySectionStyle = StyleSheet.create({
    section: {
        width: '100%',
        backgroundColor: 'hsl(218, 100%, 96%)'
    }
});