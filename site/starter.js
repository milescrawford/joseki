const STARTER_JOSEKIS = {
  "version": 2,
  "groups": [
    {
      "name": "Example Joseki",
      "enabled": true,
      "josekis": [
        {
          "id": 4,
          "comment": "Approach 3-4 high and settle facing in front of the 3-4.",
          "moves": [
            "3,2,false",
            "3,4,false",
            "2,4,false",
            "2,5,false",
            "2,3,false",
            "3,5,false",
            "5,2,false",
            "3,9,false"
          ],
          "enabled": true
        },
        {
          "id": 17,
          "comment": "Approach 3-4 high, settle facing to the side of the 3-4.",
          "moves": [
            "3,2,false",
            "3,4,false",
            "2,4,false",
            "3,3,false",
            "2,3,false",
            "4,2,false",
            "2,2,false",
            "3,5,false"
          ],
          "enabled": true
        },
        {
          "id": 7,
          "comment": "Approach 3-4 low, get kicked, and settle low.",
          "moves": [
            "3,2,false",
            "2,4,false",
            "2,3,false",
            "3,4,false",
            "5,2,false",
            "2,8,false"
          ],
          "enabled": true
        },
        {
          "id": 14,
          "comment": "Approach 3-4 low, get kicked, settle high.",
          "moves": [
            "3,2,false",
            "2,4,false",
            "2,3,false",
            "3,4,false",
            "5,2,false",
            "3,8,false"
          ],
          "enabled": true
        },
        {
          "id": 16,
          "comment": "Approach 3-4 low, make more fragile, faster extension.",
          "moves": [
            "16,3,false",
            "14,2,false",
            "15,5,false"
          ],
          "enabled": true
        },
        {
          "id": 15,
          "comment": "Approach 3-4 low, make solid, calm extension.",
          "moves": [
            "16,3,false",
            "14,2,false",
            "15,4,false"
          ],
          "enabled": true
        },
        {
          "id": 20,
          "comment": "Approach 4-4 high, back off high, give defender large corner in exchange for influence.",
          "moves": [
            "15,15,false",
            "13,15,false",
            "15,13,false",
            "15,16,false",
            "16,16,false",
            "14,16,false",
            "16,17,false",
            "13,13,false"
          ],
          "enabled": true
        },
        {
          "id": 21,
          "comment": "Approach 4-4 high, back off high, trade corner potential for influence.",
          "moves": [
            "15,3,false",
            "15,5,false",
            "13,3,false",
            "13,5,false"
          ],
          "enabled": true
        },
        {
          "id": 10,
          "comment": "Approach 4-4 low, back off, and settle calmly.",
          "moves": [
            "3,3,false",
            "2,5,false",
            "5,2,false",
            "1,3,false",
            "2,2,false",
            "2,8,false"
          ],
          "enabled": true
        },
        {
          "id": 19,
          "comment": "Approach 4-4 low, back off, force defender to split corner, develop sides.",
          "moves": [
            "3,3,false",
            "2,5,false",
            "5,2,false",
            "2,3,false",
            "2,2,false",
            "1,2,false",
            "2,4,false",
            "1,3,false",
            "3,4,false",
            "1,4,false",
            "2,1,false",
            "3,5,false"
          ],
          "enabled": true
        },
        {
          "id": 5,
          "comment": "Approach 4-4 low, back off, force defender to split the corner, and keep side low.",
          "moves": [
            "3,3,false",
            "2,5,false",
            "5,2,false",
            "2,3,false",
            "2,2,false",
            "1,2,false",
            "2,4,false",
            "1,3,false",
            "3,4,false",
            "1,4,false",
            "3,5,false",
            "2,6,false"
          ],
          "enabled": true
        },
        {
          "id": 9,
          "comment": "Approach 4-4 low, get kicked, get side thickness.",
          "moves": [
            "3,3,false",
            "2,5,false",
            "2,4,false",
            "3,5,false",
            "5,2,false",
            "3,9,false",
            "2,7,false",
            "3,7,false",
            "1,5,false",
            "1,6,false",
            "1,4,false",
            "2,6,false"
          ],
          "enabled": true
        },
        {
          "id": 18,
          "comment": "Approach 4-4 low, get kicked, settle.",
          "moves": [
            "3,3,false",
            "2,5,false",
            "2,4,false",
            "3,5,false",
            "5,2,false",
            "3,9,false"
          ],
          "enabled": true
        },
        {
          "id": 8,
          "comment": "Enclose 3-4.",
          "moves": [
            "3,2,false",
            "p,false",
            "2,4,false"
          ],
          "enabled": true
        },
        {
          "id": 11,
          "comment": "Enclose 4-4.",
          "moves": [
            "3,3,false",
            "p,false",
            "2,5,false"
          ],
          "enabled": true
        },
        {
          "id": 26,
          "comment": "Fuseki: Chinese.",
          "moves": [
            "15,3,false",
            "3,15,false",
            "15,16,false",
            "3,3,false",
            "16,10,false"
          ],
          "enabled": true
        },
        {
          "id": 27,
          "comment": "Fuseki: Orthodox.",
          "moves": [
            "15,15,false",
            "3,3,false",
            "16,3,false",
            "3,15,false",
            "14,2,false"
          ],
          "enabled": true
        },
        {
          "id": 25,
          "comment": "Fuseki: Sanrensei.",
          "moves": [
            "3,3,false",
            "15,15,false",
            "15,3,false",
            "3,15,false",
            "9,3,false"
          ],
          "enabled": true
        },
        {
          "id": 6,
          "comment": "Invade 4-4, defender double-hanes to retain corner.",
          "moves": [
            "3,3,false",
            "2,2,false",
            "2,3,false",
            "3,2,false",
            "4,2,false",
            "4,1,false",
            "5,1,false",
            "5,2,false",
            "4,3,false",
            "6,1,false",
            "3,1,false",
            "5,0,false",
            "2,1,false"
          ],
          "enabled": true
        },
        {
          "id": 22,
          "comment": "Invade 4-4, defender emphasizes side and sente.",
          "moves": [
            "3,3,false",
            "2,2,false",
            "3,2,false",
            "2,3,false",
            "2,5,false",
            "2,4,false",
            "3,4,false",
            "1,5,false"
          ],
          "enabled": true
        },
        {
          "id": 13,
          "comment": "Invade 4-4, defender emphasizes side influence and sente.",
          "moves": [
            "3,3,false",
            "2,2,false",
            "3,2,false",
            "2,3,false",
            "2,5,false",
            "1,5,false"
          ],
          "enabled": true
        },
        {
          "id": 23,
          "comment": "Invade 4-4, defender seals invader in with excellent influence.",
          "moves": [
            "15,3,false",
            "16,2,false",
            "16,3,false",
            "15,2,false",
            "14,2,false",
            "14,1,false",
            "13,2,false",
            "13,1,false",
            "12,2,false",
            "17,3,false",
            "17,4,false",
            "17,2,false",
            "16,5,false"
          ],
          "enabled": true
        },
        {
          "id": 12,
          "comment": "Invade 4-4, defender trades some corner territory for sente.",
          "moves": [
            "3,3,false",
            "2,2,false",
            "3,2,false",
            "2,3,false",
            "3,4,false",
            "1,5,false"
          ],
          "enabled": true
        },
        {
          "id": 24,
          "comment": "Invade 4-4, invader lives with sente.",
          "moves": [
            "15,3,false",
            "16,2,false",
            "15,2,false",
            "16,3,false",
            "16,4,false",
            "17,4,false",
            "16,5,false",
            "17,5,false",
            "16,6,false",
            "17,6,false",
            "16,7,false"
          ],
          "enabled": true
        }
      ]
    },
    {
         "enabled" : true,
         "josekis" : [
            {
               "comment" : "Keep connected after standard attach in corner.",
               "enabled" : true,
               "id" : 31,
               "moves" : [
                  "15,3,true",
                  "16,5,true",
                  "13,2,true",
                  "16,3,true",
                  "16,2,true",
                  "17,2,true",
                  "16,4,true",
                  "17,3,true",
                  "15,5,false",
                  "17,4,false",
                  "15,4,false",
                  "16,6,false"
               ]
            },
            {
               "comment" : "Push through after standard attach in corner.",
               "enabled" : true,
               "id" : 30,
               "moves" : [
                  "15,3,true",
                  "16,5,true",
                  "13,2,true",
                  "16,3,true",
                  "16,2,true",
                  "17,2,true",
                  "16,4,true",
                  "17,3,true",
                  "17,4,false",
                  "15,4,false",
                  "17,5,false",
                  "15,2,false",
                  "14,3,false",
                  "15,1,false",
                  "16,6,false",
                  "15,5,false",
                  "15,7,false"
               ]
            }
         ],
         "name" : "Setup Stone Examples"
      }
  ],
  "userSettings": {
    "allowUnrestrictedAutoStones": false
  }
}
