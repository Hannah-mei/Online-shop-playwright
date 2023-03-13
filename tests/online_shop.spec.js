//@ts-check
import {test} from '@playwright/test'
import { OnlineShop } from '../page_objects/online_shop_objects'

test ('add an item to the cart', async({page}) => {
    const onlineShop = new OnlineShop(page)
    await onlineShop.chooseItem('Apparel & accessories', 'T-shirts');
    await onlineShop.addToCart();
    await onlineShop.chooseItem('Apparel & accessories', 'Shoes');
    await onlineShop.addToCart();
    await onlineShop.searchItem('nail')
    await onlineShop.completeOrder()
})

test('write a review', async({page}) => {
    const onlineShop = new OnlineShop(page);
    await onlineShop.writeReview()
})