import { StyleSheet, Text, View } from "react-native";

export const colorNewPublicBackground = '#FCC8A6';
export const colorNewPublicText = '#5B1DF3';
export const colorNewPublicBody = '#CEE0FF';


export function NewPublicTitle({children}) {
    const s = NewPublicTitleStyle;
    return <Text style={s.title}>{children}</Text>
}

const NewPublicTitleStyle = StyleSheet.create({
    title: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 40,
        color: colorNewPublicText
    }
});

export function NewPublicTitleBanner({children}) {
    const s = NewPublicTitleBannerStyle;
    return <View style={s.banner}>
        {children}
    </View>
}

const NewPublicTitleBannerStyle = StyleSheet.create({
    banner: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 24,
        paddingTop: 16,
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