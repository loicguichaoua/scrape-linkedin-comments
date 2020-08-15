// ########################################################## //
// SCRAPING COMMENTS ON A SPECIFIC LINKEDIN POST (2020-05-16) //
// ########################################################## //



// ################################################
// MODULES
// ################################################
let puppeteer = require('puppeteer');
fs = require('fs');

// ################################################
// YOUR VARIABLES
// ################################################
// YOUR LINKEDIN CREDENTIALS
const MY_USERNAME = '';
const MY_PASSWORD = '';
// POST URL
const LINKEDIN_POST_URL = '';

// ################################################
// OTHER REQUIRED VARIABLES (no need to modify unless Linkedin is updated)
// ################################################
// LINKEDIN LOGIN PAGE
const LINKEDIN_LOGIN_URL = 'https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin';
// REQUIRED SELECTORS
// These might need to be updated from time to time if the website modifies its source code
const EMAIL_SELECTOR = '#username';
const PASSWORD_SELECTOR = '#password';
const SUBMIT_SELECTOR = '#app__container > main > div > form > div.login__form_action_container > button';
const COMMENTS_DROPDOWN_SELECTOR = 'button.comments-sort-order-toggle__trigger.artdeco-dropdown__trigger.artdeco-dropdown__trigger--placement-bottom.ember-view';
const MOST_RECENT_COMMENTS_SELECTOR = 'div.dropdown-options.comments-sort-order-toggle__content.artdeco-dropdown__content.artdeco-dropdown__content--is-open.artdeco-dropdown--is-dropdown-element.artdeco-dropdown__content--placement-bottom.ember-view > div.artdeco-dropdown__content-inner > ul > li:nth-child(2)';
const LOAD_MORE_COMMENTS_SELECTOR = 'div.comments-comments-list__show-previous-container > button';
const AUTHORS_SELECTOR = 'article > div:nth-of-type(1) > a:nth-of-type(2) > h3 > span:nth-of-type(1) > span.hoverable-link-text';
const COMMENTS_SELECTOR = 'article > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(1) > p:nth-of-type(1) > span:nth-of-type(1) > span:nth-of-type(1)';
const PROFILES_SELECTOR = 'article > div:nth-of-type(1) > a:nth-of-type(2)';



// ################################################
// MAIN FUNCTION
// ################################################
if (process.argv[1] !== undefined) { // keeping this line if we need input from user in the future
  

    (() => {
        puppeteer.launch({ headless: false }) // toggle to true to hide the browser
            .then(async (browser) => {



                // ################################################
                // LOGGING IN
                // ################################################
                let page = await browser.newPage()
                page.setViewport({ width: 1366, height: 768 });
                await page.goto(LINKEDIN_LOGIN_URL, { waitUntil: 'domcontentloaded' })
                await page.click(EMAIL_SELECTOR)
                await page.keyboard.type(MY_USERNAME);
                await page.click(PASSWORD_SELECTOR);
                await page.keyboard.type(MY_PASSWORD);
                await page.click(SUBMIT_SELECTOR);
                await page.waitForSelector(".share-box-feed-entry__wrapper.artdeco-card", { timeout: 10000 }); // waiting to make sure we had time to log in before navigating to the post's url
                await page.goto(LINKEDIN_POST_URL, { waitUntil: 'domcontentloaded' });
                


                // ################################################
                // REORDERING COMMENTS BY DATE ('Most Relevant' is selected by default)
                // ################################################
                
                // 1. Click on dropdown button to reveal the 'Most Recent' button
                try {
                    await page.waitForSelector(COMMENTS_DROPDOWN_SELECTOR, { timeout: 10000 })
                  } catch (error) {
                    console.log("The dropdown element didn't appear.")
                    browser.close()
                    return process.exit()
                  }
                await page.click(COMMENTS_DROPDOWN_SELECTOR);
                
                // 2. Click the 'Most Recent' button
                try {
                    await page.waitForSelector(MOST_RECENT_COMMENTS_SELECTOR, { timeout: 10000 })
                  } catch (error) {
                    console.log("The 'Most Recent' element didn't appear.")
                    browser.close()
                    return process.exit()
                  }
                await page.click(MOST_RECENT_COMMENTS_SELECTOR);

                console.log('Comments re-ordered by date. 📆')
                


                // ################################################
                // MAKING SURE ALL COMMENTS ARE DISPLAYED
                // ################################################
                // In order to display all of the comments we need to click on 
                // the 'Load More Comments' button repeatedly until all comments 
                // have been loaded on the page

                for (let i = 0; i < 50 ; i++) { // increase i limit if need be
                  // If i is too low some comments might not be scraped
                  // as an example: 
                  // - 5 iterations would be needed for a post that has ~30-40 comments
                  // - 50 iterations would be needed for a post that has ~700-800 comments
                    try {
                        await page.waitForSelector(LOAD_MORE_COMMENTS_SELECTOR, { timeout: 15000 }) // to wait for the 'Load More Comments' button to reappear in between querries
                        console.log("Loading comments (" + (i + 1) + "). ⏳")
                      } catch (error) {
                        console.log("The 'Load More Comments' button did not appear.")
                        console.log("'Load More Comments' button clicked " + i + " times.")
                        break
                      }
                    await page.click(LOAD_MORE_COMMENTS_SELECTOR);
                }


                // ################################################
                // PAGE IS READY, COLLECTING DATA INTO ARRAY
                // ################################################
                // The document is now ready to be scraped,
                // The script currently scrapes: name, profile url, and the comment itself
                var myArray1 = []
                var myArray2 = []
                var myArray3 = []
                var i;

                // NAME OF THE AUTHOR
                const authors = await page.$$eval(AUTHORS_SELECTOR, authors => authors.map(author => author.textContent))
                i = 0
                authors.forEach(author => {
                  myArray1[i] = author;
                  // console.log(myArray1[i]); // if needed for debugging
                  i++;
                });
                // console.log('myArray1: ' + myArray1.length) // if needed for debugging

                // PROFILE URL OF THE AUTHOR
                const profiles = await page.$$eval(PROFILES_SELECTOR, profiles => profiles.map(profile => profile.getAttribute('href')))
                i = 0
                profiles.forEach(profile => {
                  myArray2[i] = 'https://www.linkedin.com' + profile;
                  // console.log(myArray2[i]); // if needed for debugging
                  i++;
                });
                // console.log('myArray2: ' + myArray2.length) // if needed for debugging

                // CONTENT OF THE COMMENT
                const comments = await page.$$eval(COMMENTS_SELECTOR, comments => comments.map(comment => comment.textContent))
                i = 0
                comments.forEach(comment => {
                  myArray3[i] = comment.replace(/[\n\r]/g, ""); // removing line returns from comments
                  // console.log(myArray3[i]); // if needed for debugging
                  i++;
                });
                // console.log('myArray3: ' + myArray3.length) // if needed for debugging
                
                nbOfComments = Math.max(myArray1.length,myArray2.length,myArray3.length)
                console.log(nbOfComments + ' comments scraped. 💪')
                
                browser.close()



                // ################################################
                // CREATING CSV FROM ARRAYS
                // ################################################
                let text = ""
                // Formatting data
                for (i = 0; i < nbOfComments; i++) {
                  text += (i + 1) + ";" + myArray1[i] + ";" + myArray2[i] + ";" + myArray3[i] + "\n"; // feel free to substitute ";" with any delimiter that suits you
                }
                // Naming the file
                date = new Date().toISOString().
                  replace(/T/, '_').
                  replace(/:/, 'h').
                  replace(/:/, 'm').
                  replace(/\..+/, 's')
                csvName = date + '_' + nbOfComments + 'comments.csv'
                //Creating 'output' directory
                if (! fs.existsSync('./output')) {
                  fs.mkdir('./output', (err) => {
                    if (err) {
                      console.log('Error creating output folder: '+err);
                      return;
                    }
                    console.log('output folder created.');
                  });
                };
                // Writing csv file
                fs.writeFile('./output/' + csvName, text, function (err) {
                  if (err) return console.log(err);
                  console.log('CSV file saved in the script folder: ./output/' + csvName);
                });

            })
            .catch((err) => {
                console.log("An error occurred 😭:\n", err);
            })
    })()
}