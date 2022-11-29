import express from 'express'

import { User } from '../models/User.js'
import { Bet } from '../models/Bet.js'

const router = express.Router()

router.get('/', async (req, res) => {
    res.json({ data: req.user })
})

router.post('/:userName/bets', async (req, res) => {
    const { bets } = req.body
    const { userName } = req.params

    const user = await User.findOne({ userName })

	if (!user) return res.json({ message: 'No user with this username.' })

    if (bets?.length !== 0) {
        const filteredBets = bets.filter(({ eventId, outcome }) => eventId && outcome)

        if (filteredBets.length !== 0) {
            const data = await Bet.bulkWrite(filteredBets.map(({ eventId, outcome }) => ({
                updateOne: {
                    filter: { userId: user._id, eventId },
                    update: { outcome },
                    upsert: true
                }
            })))
    
            res.json({ data })
        }
    } else {
        return res.json({ message: 'Please provide valid bets information.' })
    }

})

router.get('/standings', async (req, res) => {
    try {
        const users = User.find()

        console.log('USERS', users)
    } catch (error) {
        return res.json({ error })
    }
})

export default router
