import { HorizBox, Pad, Pill, ScrollableScreen, SmallTitleLabel, WideScreen } from "../component/basics";
import { BasicComments, BlingLabel, Comment, CommentContext } from "../component/comment";
import { boolToInt, expandDataList } from "../util/util"
import { authorRobEnnals } from "../data/authors";
import { useCollection, useGlobalProperty } from "../util/datastore";
import { godzilla_article, godzilla_title_comments } from "../data/articles/godzilla";
import { Article, MaybeArticleScreen } from "../component/article";
import { cbc_sport_article } from "../data/articles/cbc_sport";
import { TranslatableLabel } from "../component/translation";

const description = `
Conversation participants can be given titles by a trusted organization.
This allows other readers to know that that person might be more credible.
Posts by titled writers are sorted to the top of the list of comments, even if they
aren't the most recent.
`

export const TitledWritersPrototype = {
    key: 'titledwriters',
    name: 'Titled Writers',
    author: authorRobEnnals,
    date: '2023-08-16',
    description,
    screen: TitledWritersScreen,
    instance: [
        {key: 'godzilla', name: 'Godzilla Article', article: godzilla_article, 
            personaTitle: {
                a: 'Mayor',
                b: 'Chief of Police',
                c: 'Professor'
            },
            personalOrg: {
                a: 'City of New York',
                b: 'New York Police Department',
                c: 'Columbia University'
            },
            comment: expandDataList(godzilla_title_comments)},
        {key: 'godzilla-raw', name: 'Godzilla Raw',
            title: 'What should we do about Godzilla attacking New York?',
            personaTitle: {
                a: 'Mayor',
                b: 'Chief of Police',
                c: 'Professor'
            },
            personalOrg: {
                a: 'City of New York',
                b: 'New York Police Department',
                c: 'Columbia University'
            },
            comment: expandDataList(godzilla_title_comments),
        },
        {key: 'sport', name: 'CBC Soccer', article: cbc_sport_article, comment: expandDataList([]),
            personaTitle: {
                a: 'Mayor',
                b: 'Coach',
                c: 'Police Officer'
            },
            personalOrg: {
                a: 'City of Calgary',
                b: 'Calgary Football Club',
                c: 'Calgary Police Department'
            },

        }

    ],
    newInstanceParams: []    
}

export function TitledWritersScreen() {
    const comments = useCollection('comment');
    // console.log('comments', comments);
    return <MaybeArticleScreen articleChildLabel='Comments'>
        <BasicComments config={{authorBling: [AuthorTitleBling], sortComments}} />
    </MaybeArticleScreen>
}

function AuthorTitleBling({comment}) {
    const author = comment.from;
    const personaTitle = useGlobalProperty('personaTitle');
    const personaOrg = useGlobalProperty('personalOrg');
    if (personaTitle[author] && personaOrg[author]) {
        return <HorizBox>
            <Pill text={personaTitle[author]} />
            <Pad size={4} />
            <TranslatableLabel label='at' style={{color: '#999'}} />
            <Pad size={4} />
            <Pill text={personaOrg[author]} />
        </HorizBox>
        // return <BlingLabel label={personaTitle[author] + ' at ' + personaOrg[author]} />
    }
}

function sortComments({datastore, comments}) {
    const personaTitle = useGlobalProperty('personaTitle');
    return comments.slice().sort((a, b) => boolToInt(personaTitle[b.from]) - boolToInt(personaTitle[a.from]))
}

