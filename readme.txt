This script allows you to scrape all the comments (content, author name, author profile url) of a specific Linkedin post and outputs the results in a CSV file.
Make sure to check the scraping policy of the website you plan to collect data from before you proceed.

Linkedin's source code may be updated from time to time, thus you might need to update the html selectors

1. Download the folder
2. Install nodeenv (https://pypi.org/project/nodeenv/) using: $ sudo easy_install nodeenv
3. Create new environment (inside the script folder): $ nodeenv <envname>
4. Activate new environment: $ . <envname>/bin/activate 
5. Install Puppeteer (https://pptr.dev/) within your environment using : $ npm i puppeteer
6. Edit the script by adding your Linkedin username, password, and the url of the post you wish to scrape
7. Run the script: $ node scrape_linkedin_comments.js
8. Your output csv file will be added to the output folder
9. When done, deactivate environment using: $ deactivate_node