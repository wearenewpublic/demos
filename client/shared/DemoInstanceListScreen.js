
import { Text, View } from "react-native"
import { Card, Clickable, ScrollableScreen, BigTitle, BodyText, Separator, SmallTitle, SectionTitle } from "../component/basics"

export function DemoInstanceListScreen({demo, onSelectInstance}) {
    return (
        <ScrollableScreen>
            <View>
                <BigTitle>{demo.name}</BigTitle>
                <BodyText>{demo.description}</BodyText>      
                <Separator />         
                <SectionTitle>Role Play Instances</SectionTitle> 
            </View>
            {demo.instance.map(instance => (
                <Clickable key={instance.key} onPress={() => onSelectInstance(instance.key)}>
                    <Card>
                        <SmallTitle>{instance.name}</SmallTitle>
                    </Card>
                </Clickable>
            ))}      
        </ScrollableScreen>
    )
}

