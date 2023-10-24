import { StyleSheet } from "react-native";
import { HorizBox, Pad } from "../component/basics";
import { useObject } from "../util/datastore";
import { ProfilePhoto } from "./profilephoto";
import { UtilityText } from "./text";
import { View } from "react-native";
import { formatDate, formatMiniDate } from "./date";

export function Byline({sizeType='large', userId, time}) {
    const s = BylineStyle
    const persona = useObject('persona', userId);''
    if (sizeType == 'large') {
        return <View style={s.outer}>
            <ProfilePhoto userId={userId} sizeType='large' /> 
            <View style={s.right}>
                <UtilityText sizeType='bold' text={persona?.name} />
                <UtilityText sizeType='faint' text={formatDate(time)} />
            </View>
        </View>
    } else {
        return <View style={s.smallOuter}>
            <ProfilePhoto userId={userId} sizeType='small' /> 
            <Pad size={8} />
            <UtilityText sizeType='bold' text={persona?.name} />
            <Pad size={6} />
            <UtilityText sizeType='faint' text={formatMiniDate(time)} />
        </View>
    }
}

const BylineStyle = StyleSheet.create({
    outer: {
        flexDirection: 'row',
    },
    right: {
        marginLeft: 8,
        marginTop: 4,
        marginBottom: 4,
        justifyContent: 'space-between'
    },
    smallOuter: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})