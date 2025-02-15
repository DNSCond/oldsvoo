// Learn more at developers.reddit.com/docs
import { Devvit, useState, useAsync } from '@devvit/public-api';
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
      preview: create_preview(context.appVersion),
    });
    ui.navigateTo(post);
  },
});

//function normalize_newlines(string: string) {return String(string).replace(/\r\n/g, '\n').replace(/\r/g, '\n');}
//function indent_codeblock(string: string) {return '    ' + normalize_newlines(string).replace(/\n/g, '\n    ');}
function create_preview(appVersion: string) {
  const bottoms_iterator = 0, glasses_iterator = 0, grippables_iterator = 0, hats_iterator = 0, tops_iterator = 0;
  const svgElement = svgBuilder(
    bottoms_iterator,
    glasses_iterator,
    grippables_iterator,
    hats_iterator,
    tops_iterator);
  return (
    <vstack height="100%" width="100%" gap="medium" alignment="center middle">
      <image imageWidth={400} imageHeight={400} width="200px" height="200px" url={svgElement.output} />
      <hstack gap="medium">
        <button appearance="primary" disabled={true}>
          &lt;
        </button>
        <text>loading ({appVersion})</text>
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
    const iterators: any = {
      bottoms_iterator, set_bottoms_iterator,
      glasses_iterator, set_glasses_iterator,
      grippables_iterator, set_grippables_iterator,
      hats_iterator, set_hats_iterator,
      tops_iterator, set_tops_iterator,
    };
    // @ts-ignore
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
              set_error_message(`JSON-error: ${data} ${error}`);
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
        insertion = <>
          <hstack gap="medium">
            <button appearance="primary" disabled={true}>
              &lt;
            </button>
            <text>their snoo</text>
            <button appearance="primary" disabled={true}>
              &gt;
            </button>
          </hstack>
          <button appearance="caution" onPress={function () {
            set_postType('editor');
          }}>Remix</button>
        </>;
        break;
      default:
        insertion = <>
          <hstack gap="medium">
            <button appearance="primary" onPress={set_iterator('-')}>&lt;</button>
            <text>{iterator_} / {String(svgElement[`${category}_bundle_length`] ?? '0')}</text>
            <button appearance="primary" onPress={set_iterator('+')}>&gt;</button>
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
          <button appearance="success" onPress={async function () {
            const currentUser = await context.reddit.getCurrentUser(), subreddit = await context.reddit.getCurrentSubreddit();
            if (currentUser && subreddit) {
              context.ui.showToast("Submitting your post - upon completion you'll navigate there.");
              const post = await context.reddit.submitPost({
                title: `u/${currentUser.username}'s new snoo (${context.appVersion})`,
                subredditName: subreddit.name, preview: create_preview(context.appVersion),
              });
              context.redis.set(`user-iterator-${post.id}`, JSON.stringify({
                bottoms_iterator, glasses_iterator, grippables_iterator, hats_iterator, tops_iterator
              }));
              context.ui.navigateTo(post);
            } else {
              context.ui.showToast("Sorry. only accounts with username can post");
            }
          }}>share it! (make a post about it)</button>
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
