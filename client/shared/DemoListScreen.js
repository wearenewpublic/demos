import { Text } from "react-native"
import { BigTitle, BodyText, Card, Clickable, ScrollableScreen, SmallTitle } from "../component/basics"
import { demos } from "../demo"

export function DemoListScreen({onSelectDemo}) {
    return (
        <ScrollableScreen>
            <BigTitle>New Public Demo Garden</BigTitle>
            {demos.map(demo => 
                <Clickable key={demo.key} onPress={() => onSelectDemo(demo.key)}>
                    <Card>
                        <SmallTitle>{demo.name}</SmallTitle>
                        <BodyText>{demo.description}</BodyText>
                    </Card>
                </Clickable>        
            )}
        </ScrollableScreen>
    )
}


