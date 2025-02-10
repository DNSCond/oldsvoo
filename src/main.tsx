// Learn more at developers.reddit.com/docs
import { Devvit, useState, useAsync, useForm } from '@devvit/public-api';
import { svgBuilder } from './assets-function.ts';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'create snoopost',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: `Snoovatar (${context.appVersion})`,
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: create_preview(),
    });
    ui.navigateTo(post);
  },
});

function normalize_newlines(string: string) {
  return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
function indent_codeblock(string: string) {
  return '    ' + normalize_newlines(string).replace(/\n/g, '\n    ');
}
function create_preview() {
  const bottoms_iterator = 0, glasses_iterator = 0, grippables_iterator = 0, hats_iterator = 0, tops_iterator = 0;
  const svgElement = svgBuilder(
    bottoms_iterator,
    glasses_iterator,
    grippables_iterator,
    hats_iterator,
    tops_iterator);
  /*<hstack gap="medium">
        <button appearance="primary" disabled={true}>
          &lt;
        </button>
        <text>loading</text>
        <button appearance="primary" disabled={true}>
          &gt;
        </button>
      </hstack>
      <hstack gap="medium">
        <button appearance={"secondary"} disabled={true}>hats ({hats_iterator})</button>
        <button appearance={"secondary"} disabled={true}>glasses ({glasses_iterator})</button>
        <button appearance={"secondary"} disabled={true}>grippables ({grippables_iterator})</button>
      </hstack>
      <hstack gap="medium">
        <button appearance={"secondary"} disabled={true}>tops ({tops_iterator})</button>
        <button appearance={"secondary"} disabled={true}>bottoms ({bottoms_iterator})</button>
      </hstack>
      <hstack gap="medium">
        <button appearance="success" disabled={true}>share it! (make a post about it)</button>
      </hstack>*/
  return (
    <vstack height="100%" width="100%" gap="medium" alignment="center middle">
      <image imageWidth={400} imageHeight={400} width="200px" height="200px" url={svgElement.output} />
      <hstack gap="medium">
        <button appearance="primary" disabled={true}>
          &lt;
        </button>
        <text>loading</text>
        <button appearance="primary" disabled={true}>
          &gt;
        </button>
      </hstack>
    </vstack>
  );
}

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const [iterator_, setIterator_] = useState(0);
    const [category, setcategory] = useState('grippables');
    const [bottoms_iterator, set_bottoms_iterator] = useState(0);
    const [glasses_iterator, set_glasses_iterator] = useState(0);
    const [grippables_iterator, set_grippables_iterator] = useState(0);
    const [hats_iterator, set_hats_iterator] = useState(0);
    const [tops_iterator, set_tops_iterator] = useState(0);
    const [postType, set_postType] = useState('editor');
    const [error_message, set_error_message] = useState('error_message');
    //const [username, set_username] = useState(null);
    //const [stars, set_stars] = useState(0);
    //
    const iterators: any = {
      bottoms_iterator, set_bottoms_iterator,
      glasses_iterator, set_glasses_iterator,
      grippables_iterator, set_grippables_iterator,
      hats_iterator, set_hats_iterator,
      tops_iterator, set_tops_iterator,
    };
    useAsync(async function () {
      return await context.redis.get(`user-iterator-${context.postId}`);
    }, {
      finally: function (data, error) {
        if (!error) {
          if (data) {
            const redisData = JSON.parse(String(data));
            if (redisData) {
              //set_username(redisData.username ?? null);
              set_bottoms_iterator(redisData['bottoms_iterator']);
              set_glasses_iterator(redisData['glasses_iterator']);
              set_grippables_iterator(redisData['grippables_iterator']);
              set_hats_iterator(redisData['hats_iterator']);
              set_tops_iterator(redisData['tops_iterator']);
              set_postType('Rating');
            } else {
              console.log(`JSON-error: ${data} ${error}`);
              set_postType('Errored');
            }
          }
        } else {
          set_postType('Errored');
          set_error_message(`Redis-error: ${error}`);
        }
      },
    });
    const svgElement = svgBuilder(
      bottoms_iterator,
      glasses_iterator,
      grippables_iterator,
      hats_iterator,
      tops_iterator);
    function setNewCategory(newCat: string): any {
      return function () {
        if (iterators[`set_${category}_iterator`] !== undefined) {
          iterators[`set_${category}_iterator`](iterators[`${category}_iterator`]);
          setIterator_(iterators[`${category}_iterator`]);
        } else {
          setIterator_(0);
        }
        setcategory(newCat);
        setIterator_(iterators[`${newCat}_iterator`]);
      };
    };
    function set_iterator(sign: "+" | "-"): any {
      return function (): void {
        const newItem = iterator_ + Number(`${sign}1`);
        setIterator_(newItem !== newItem ? 0 : newItem);
        if (iterators[`set_${category}_iterator`] !== undefined) {
          iterators[`set_${category}_iterator`](newItem);
        }
      }
    }
    let insertion = <></>;
    switch (postType) {
      case 'Errored':
        insertion = <>
          <hstack gap="medium">
            <button appearance="primary" disabled={true}>
              &lt;
            </button>
            <text>Errored ({error_message})</text>
            <button appearance="primary" disabled={true}>
              &gt;
            </button>
          </hstack>
        </>;
        break;
      case 'Rating':
        /*const disabled = username === null;*/
        insertion = <>
          <hstack gap="medium">
            <button appearance="primary" disabled={true}>
              &lt;
            </button>
            <text>Rating</text>
            <button appearance="primary" disabled={true}>
              &gt;
            </button>
          </hstack>
        </>;/*<text>&#x2605; {stars}</text>

        <hstack gap="medium">
            <button appearance={stars === 1 ? "primary" : "secondary"} disabled={disabled} onPress={(function () { set_stars(1); })}>&#x2605;</button>
            <button appearance={stars === 2 ? "primary" : "secondary"} disabled={disabled} onPress={(function () { set_stars(2); })}>&#x2605; &#x2605;</button>
            <button appearance={stars === 3 ? "primary" : "secondary"} disabled={disabled} onPress={(function () { set_stars(3); })}>&#x2605; &#x2605; &#x2605;</button>
          </hstack>
          <hstack gap="medium">
            <button appearance={stars === 4 ? "primary" : "secondary"} disabled={disabled} onPress={(function () { set_stars(4); })}>&#x2605; &#x2605; &#x2605; &#x2605;</button>
            <button appearance={stars === 5 ? "primary" : "secondary"} disabled={disabled} onPress={(function () { set_stars(5); })}>&#x2605; &#x2605; &#x2605; &#x2605; &#x2605;</button>
          </hstack>
          <button appearance="success" disabled={disabled} onPress={async function () {
            const currentUser = await context.reddit.getCurrentUser();
            if (currentUser) {
            } else {
              context.ui.showToast("Sorry. only accounts with username can post");
            }
          }}>POST!</button>*/
        break;
      default:
        insertion = <>
          <hstack gap="medium">
            <button appearance="primary" onPress={set_iterator('-')}>
              &lt;
            </button>
            <text>{iterator_} / {String(svgElement[`${category}_bundle_length`] ?? '0')}</text>
            <button appearance="primary" onPress={set_iterator('+')}>
              &gt;
            </button>
          </hstack>
          <hstack gap="medium">
            <button appearance={category === 'hats' ? "primary" : "secondary"} onPress={setNewCategory('hats')}>hats ({hats_iterator})</button>
            <button appearance={category === 'glasses' ? "primary" : "secondary"} onPress={setNewCategory('glasses')}>glasses ({glasses_iterator})</button>
            <button appearance={category === 'grippables' ? "primary" : "secondary"} onPress={setNewCategory('grippables')}>grippables ({grippables_iterator})</button>
          </hstack>
          <hstack gap="medium">
            <button appearance={category === 'tops' ? "primary" : "secondary"} onPress={setNewCategory('tops')}>tops ({tops_iterator})</button>
            <button appearance={category === 'bottoms' ? "primary" : "secondary"} onPress={setNewCategory('bottoms')}>bottoms ({bottoms_iterator})</button>
          </hstack>
          <hstack gap="medium">
            <button appearance="success" disabled={false} onPress={async function () {
              const currentUser = await context.reddit.getCurrentUser();
              if (currentUser) {
                context.ui.showToast("Submitting your post - upon completion you'll navigate there.");
                const post = await context.reddit.submitPost({
                  title: `u/${currentUser.username}'s new snoo (V${context.appVersion})`,
                  subredditName: (await context.reddit.getCurrentSubreddit()).name,
                  preview: create_preview(),
                }); const username = currentUser.username;
                await context.redis.set(`user-iterator-${post.id}`, JSON.stringify({
                  username, bottoms_iterator, glasses_iterator, 
                  grippables_iterator, hats_iterator, tops_iterator
                }));
                context.ui.navigateTo(post);
              } else {
                context.ui.showToast("Sorry. only accounts with username can post");
              }
            }}>share it! (make a post about it)</button>
          </hstack>
        </>;
        break;
    }
    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <image imageWidth={400} imageHeight={400} width="200px" height="200px" url={svgElement.output} />
        {insertion}
      </vstack>
    );
  },
});

export default Devvit;
