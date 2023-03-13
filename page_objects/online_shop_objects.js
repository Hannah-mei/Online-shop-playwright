const {expect} = require('@playwright/test')

let prices = [];

exports.OnlineShop = class OnlineShop {
    constructor (page) {
        this.page = page
    }

    async goToHomepage() {
        await this.page.goto('https://automationteststore.com/')
    }

    async chooseItem(category, subcategory) {
        this.goToHomepage()
        await this.page.getByRole('link', { name: `${category}` }).hover()
        await this.page.getByRole('link', { name: `${subcategory}` }).click()
        await this.page.getByTitle('Add to Cart').nth(1).click()
    }

    async addToCart() {
        function removeDollarSign(str) {
            return str.replace('$', "")
        }
        function pushPrices(arr, a) {
            let pricesArr = arr.push(a)
            return pricesArr
        }

        //Checking the number of items
        let initialNumberOfItems = Number(await this.page.locator('.block_7').locator('[class="label label-orange font14"]').textContent());
        
        //Checking the total price in the topcart
        let priceStr = await this.page.locator('.productfilneprice').textContent();
        let priceNum = parseFloat(removeDollarSign(priceStr))
        await pushPrices(prices, priceNum)
        let sum = prices.reduce((partialSum, a) => partialSum+ +a, 0)

        await this.page.getByText('Add to Cart').click()

        //Checking the number of items
        let finalNumberOfItems = Number(await this.page.locator('.block_7').locator('[class="label label-orange font14"]').textContent())
        await expect(finalNumberOfItems).toBe(++initialNumberOfItems)
        
        //Checking the total price in the topcart
        let topcartTotalPriceSrt = await this.page.locator('.dropdown-toggle .cart_total').textContent();
        let topcartTotalPriceNum = parseFloat(removeDollarSign(topcartTotalPriceSrt))
        await expect(topcartTotalPriceNum).toEqual(sum)
    }

    async searchItem(keyword) {
        await this.page.locator('#filter_keyword').fill(keyword)
        await this.page.getByTitle('Go').click()
        let breadcrumb = await this.page.locator('.breadcrumb').locator('li').nth(1).getByRole('link').innerText()
        if ( breadcrumb == "Search") {
            let jumbotron = await this.page.locator('[class="pricetag jumbotron"]')
            let num = await jumbotron.count();
            for (let i=0; i<num; i++) {
                let attr = await jumbotron.nth(i).getByRole('link').getAttribute('title')
                if (attr == 'Add to Cart') {
                    await jumbotron.nth(i).getByRole('link').click();
                    break
                }
            }
            await this.addToCart()
        } else {
            await this.addToCart()
        }
    }

    async completeOrder() {
        await this.page.goto('https://automationteststore.com/index.php?rt=checkout/cart')
        await this.page.locator('#cart_checkout1').click()
        await this.page.locator('#accountFrm_accountguest').check()
        await this.page.getByTitle('Continue').click()
        await this.completeForm()
        await this.page.locator('#checkout_btn').click()
        await expect(this.page.locator('.maintext')).toHaveText('Your Order Has Been Processed!')

    }

    async completeForm() {
        await this.addressValidation()
        let data = ['John', 'Snow', 'john@snow.com', 'Downing St 10', 'London', '81-095']
        let textFields = ['#guestFrm_firstname', '#guestFrm_lastname', '#guestFrm_email', '#guestFrm_address_1', '#guestFrm_city', '#guestFrm_postcode']
        for (let i=0; i<textFields.length; i++) {
            await this.page.locator(textFields[i]).fill(data[i])
        }
        await this.page.locator('#guestFrm_country_id').selectOption('Ukraine')
        await this.page.locator('#guestFrm_zone_id').selectOption('Kyiv')
        await this.page.getByTitle('Continue').click()
    }

    async addressValidation() {
        let textFieldsAndEntries = {
            '#guestFrm_address_1' : ['s', 'sn', 'beOq3WvsnzfeHCjHNPhQwusyqDzqIyXm4t1vGrp9l7R6K9BcwvVgJjQG4Ujgk6ge4WwuWNrtCgMx01jflHC3n181TiM6O8ZIc8yULYyJIzRkZANtJvmG6tNG11msZrkU5'],
            '#guestFrm_city' : ['s', 'sn', 'beOq3WvsnzfeHCjHNPhQwusyqDzqIyXm4t1vGrp9l7R6K9BcwvVgJjQG4Ujgk6ge4WwuWNrtCgMx01jflHC3n181TiM6O8ZIc8yULYyJIzRkZANtJvmG6tNG11msZrkU5'],
            '#guestFrm_postcode': ['s', 'sn', '7RFxPAKrVAm']
        }
        let textFieldsAndErrorMessages = {
            'Address 1:': 'Address 1 must be greater than 3 and less than 128 characters!',
            'City:': 'City must be greater than 3 and less than 128 characters!',
            'ZIP/Post Code:': 'Zip/postal code must be between 3 and 10 characters!'
        }
        let textFields = Object.keys(textFieldsAndEntries)
        let wrongValues = Object.values(textFieldsAndEntries)
        let errorMessages = Object.values(textFieldsAndErrorMessages)
        for (let i=0; i<textFields.length; i++) {
            for (let j=0; j<wrongValues[i].length; j++) {
                await this.page.locator(textFields[i]).fill(wrongValues[i][j])
                await this.page.getByTitle('Continue').click()
                await expect(this.page.locator('[class="form-group has-error"]', {has: this.page.locator(textFields[i])})).toContainText(errorMessages[i])
            }
        }
        await this.page.locator('#guestFrm_country_id').selectOption("FALSE")
        await this.page.getByTitle('Continue').click()
        await expect(this.page.locator('[class="form-group has-error"]', {has: this.page.locator('#guestFrm_country_id')})).toContainText('Please select a country!')
    }

    async writeReview() {
        await this.goToHomepage();
        let thumbnail = await this.page.locator('.thumbnail').first();
        await thumbnail.hover()
        await thumbnail.getByText('Write Review').click();
        await this.page.getByTitle('5').click();
        await this.page.locator('#name').fill('John');
        await this.page.locator('#text').fill('Something')
        await this.page.getByRole('button', {name: 'Submit'}).click()
        await expect(this.page.locator('[class="alert alert-error alert-danger"]')).toContainText('Human verification has failed! Please try again.')
    }

}