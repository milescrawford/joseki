const assert = chai.assert;

describe('ensureBackwardsCompatibility', function () {
  const originalJosekis = [{"id":27,"comment":"Fuseki: Orthodox.","moves":["15,15","3,3","16,3","3,15","14,2"]},{"id":4,"comment":"Approach 3-4 high and settle facing in front of the 3-4.","moves":["3,2","3,4","2,4","2,5","2,3","3,5","5,2","3,9"]},{"id":17,"comment":"Approach 3-4 high, settle facing to the side of the 3-4.","moves":["3,2","3,4","2,4","3,3","2,3","4,2","2,2","3,5"]},{"id":7,"comment":"Approach 3-4 low, get kicked, and settle low.","moves":["3,2","2,4","2,3","3,4","5,2","2,8"]},{"id":14,"comment":"Approach 3-4 low, get kicked, settle high.","moves":["3,2","2,4","2,3","3,4","5,2","3,8"]},{"id":16,"comment":"Approach 3-4 low, make more fragile, faster extension.","moves":["16,3","14,2","15,5"]},{"id":15,"comment":"Approach 3-4 low, make solid, calm extension.","moves":["16,3","14,2","15,4"]},{"id":20,"comment":"Approach 4-4 high, back off high, give defender large corner in exchange for influence.","moves":["15,15","13,15","15,13","15,16","16,16","14,16","16,17","13,13"]},{"id":21,"comment":"Approach 4-4 high, back off high, trade corner potential for influence.","moves":["15,3","15,5","13,3","13,5"]},{"id":10,"comment":"Approach 4-4 low, back off, and settle calmly.","moves":["3,3","2,5","5,2","1,3","2,2","2,8"]},{"id":19,"comment":"Approach 4-4 low, back off, force defender to split corner, develop sides.","moves":["3,3","2,5","5,2","2,3","2,2","1,2","2,4","1,3","3,4","1,4","2,1","3,5"]},{"id":5,"comment":"Approach 4-4 low, back off, force defender to split the corner, and keep side low.","moves":["3,3","2,5","5,2","2,3","2,2","1,2","2,4","1,3","3,4","1,4","3,5","2,6"]},{"id":9,"comment":"Approach 4-4 low, get kicked, get side thickness.","moves":["3,3","2,5","2,4","3,5","5,2","3,9","2,7","3,7","1,5","1,6","1,4","2,6"]},{"id":18,"comment":"Approach 4-4 low, get kicked, settle.","moves":["3,3","2,5","2,4","3,5","5,2","3,9"]},{"id":8,"comment":"Enclose 3-4.","moves":["3,2","pass","2,4"]},{"id":11,"comment":"Enclose 4-4.","moves":["3,3","pass","2,5"]},{"id":26,"comment":"Fuseki: Chinese.","moves":["15,3","3,15","15,16","3,3","16,10"]},{"id":25,"comment":"Fuseki: Sanrensei.","moves":["3,3","15,15","15,3","3,15","9,3"]},{"id":6,"comment":"Invade 4-4, defender double-hanes to retain corner.","moves":["3,3","2,2","2,3","3,2","4,2","4,1","5,1","5,2","4,3","6,1","3,1","5,0","2,1"]},{"id":22,"comment":"Invade 4-4, defender emphasizes side and sente.","moves":["3,3","2,2","3,2","2,3","2,5","2,4","3,4","1,5"]},{"id":13,"comment":"Invade 4-4, defender emphasizes side influence and sente.","moves":["3,3","2,2","3,2","2,3","2,5","1,5"]},{"id":23,"comment":"Invade 4-4, defender seals invader in with excellent influence.","moves":["15,3","16,2","16,3","15,2","14,2","14,1","13,2","13,1","12,2","17,3","17,4","17,2","16,5"]},{"id":12,"comment":"Invade 4-4, defender trades some corner territory for sente.","moves":["3,3","2,2","3,2","2,3","3,4","1,5"]},{"id":24,"comment":"Invade 4-4, invader lives with sente.","moves":["15,3","16,2","15,2","16,3","16,4","17,4","16,5","17,5","16,6","17,6","16,7"]}];
  const v0enabledJosekis = [{"id": 27,"comment": "Fuseki: Orthodox.","moves": ["15,15", "3,3", "16,3", "3,15", "14,2"],"enabled": true}, {"id": 4,"comment": "Approach 3-4 high and settle facing in front of the 3-4.","moves": ["3,2", "3,4", "2,4", "2,5", "2,3", "3,5", "5,2", "3,9"],"enabled": true}, {"id": 17,"comment": "Approach 3-4 high, settle facing to the side of the 3-4.","moves": ["3,2", "3,4", "2,4", "3,3", "2,3", "4,2", "2,2", "3,5"],"enabled": true}, {"id": 7,"comment": "Approach 3-4 low, get kicked, and settle low.","moves": ["3,2", "2,4", "2,3", "3,4", "5,2", "2,8"],"enabled": true}, {"id": 14,"comment": "Approach 3-4 low, get kicked, settle high.","moves": ["3,2", "2,4", "2,3", "3,4", "5,2", "3,8"],"enabled": true}, {"id": 16,"comment": "Approach 3-4 low, make more fragile, faster extension.","moves": ["16,3", "14,2", "15,5"],"enabled": true}, {"id": 15,"comment": "Approach 3-4 low, make solid, calm extension.","moves": ["16,3", "14,2", "15,4"],"enabled": true}, {"id": 20,"comment": "Approach 4-4 high, back off high, give defender large corner in exchange for influence.","moves": ["15,15", "13,15", "15,13", "15,16", "16,16", "14,16", "16,17", "13,13"],"enabled": true}, {"id": 21,"comment": "Approach 4-4 high, back off high, trade corner potential for influence.","moves": ["15,3", "15,5", "13,3", "13,5"],"enabled": true}, {"id": 10,"comment": "Approach 4-4 low, back off, and settle calmly.","moves": ["3,3", "2,5", "5,2", "1,3", "2,2", "2,8"],"enabled": true}, {"id": 19,"comment": "Approach 4-4 low, back off, force defender to split corner, develop sides.","moves": ["3,3", "2,5", "5,2", "2,3", "2,2", "1,2", "2,4", "1,3", "3,4", "1,4", "2,1", "3,5"],"enabled": true}, {"id": 5,"comment": "Approach 4-4 low, back off, force defender to split the corner, and keep side low.","moves": ["3,3", "2,5", "5,2", "2,3", "2,2", "1,2", "2,4", "1,3", "3,4", "1,4", "3,5", "2,6"],"enabled": true}, {"id": 9,"comment": "Approach 4-4 low, get kicked, get side thickness.","moves": ["3,3", "2,5", "2,4", "3,5", "5,2", "3,9", "2,7", "3,7", "1,5", "1,6", "1,4", "2,6"],"enabled": true}, {"id": 18,"comment": "Approach 4-4 low, get kicked, settle.","moves": ["3,3", "2,5", "2,4", "3,5", "5,2", "3,9"],"enabled": true}, {"id": 8,"comment": "Enclose 3-4.","moves": ["3,2", "pass", "2,4"],"enabled": true}, {"id": 11,"comment": "Enclose 4-4.","moves": ["3,3", "pass", "2,5"],"enabled": true}, {"id": 26,"comment": "Fuseki: Chinese.","moves": ["15,3", "3,15", "15,16", "3,3", "16,10"],"enabled": true}, {"id": 25,"comment": "Fuseki: Sanrensei.","moves": ["3,3", "15,15", "15,3", "3,15", "9,3"],"enabled": true}, {"id": 6,"comment": "Invade 4-4, defender double-hanes to retain corner.","moves": ["3,3", "2,2", "2,3", "3,2", "4,2", "4,1", "5,1", "5,2", "4,3", "6,1", "3,1", "5,0", "2,1"],"enabled": true}, {"id": 22,"comment": "Invade 4-4, defender emphasizes side and sente.","moves": ["3,3", "2,2", "3,2", "2,3", "2,5", "2,4", "3,4", "1,5"],"enabled": true}, {"id": 13,"comment": "Invade 4-4, defender emphasizes side influence and sente.","moves": ["3,3", "2,2", "3,2", "2,3", "2,5", "1,5"],"enabled": true}, {"id": 23,"comment": "Invade 4-4, defender seals invader in with excellent influence.","moves": ["15,3", "16,2", "16,3", "15,2", "14,2", "14,1", "13,2", "13,1", "12,2", "17,3", "17,4", "17,2", "16,5"],"enabled": true}, {"id": 12,"comment": "Invade 4-4, defender trades some corner territory for sente.","moves": ["3,3", "2,2", "3,2", "2,3", "3,4", "1,5"],"enabled": true}, {"id": 24,"comment": "Invade 4-4, invader lives with sente.","moves": ["15,3", "16,2", "15,2", "16,3", "16,4", "17,4", "16,5", "17,5", "16,6", "17,6", "16,7"],"enabled": true}];
  const v1GroupedJosekis = {version: 1,groups: [{name: "Existing Josekis",enabled: true,josekis: [{"id": 27,"comment": "Fuseki: Orthodox.","moves": ["15,15", "3,3", "16,3", "3,15", "14,2"],"enabled": true}, {"id": 4,"comment": "Approach 3-4 high and settle facing in front of the 3-4.","moves": ["3,2", "3,4", "2,4", "2,5", "2,3", "3,5", "5,2", "3,9"],"enabled": true}, {"id": 17,"comment": "Approach 3-4 high, settle facing to the side of the 3-4.","moves": ["3,2", "3,4", "2,4", "3,3", "2,3", "4,2", "2,2", "3,5"],"enabled": true}, {"id": 7,"comment": "Approach 3-4 low, get kicked, and settle low.","moves": ["3,2", "2,4", "2,3", "3,4", "5,2", "2,8"],"enabled": true}, {"id": 14,"comment": "Approach 3-4 low, get kicked, settle high.","moves": ["3,2", "2,4", "2,3", "3,4", "5,2", "3,8"],"enabled": true}, {"id": 16,"comment": "Approach 3-4 low, make more fragile, faster extension.","moves": ["16,3", "14,2", "15,5"],"enabled": true}, {"id": 15,"comment": "Approach 3-4 low, make solid, calm extension.","moves": ["16,3", "14,2", "15,4"],"enabled": true}, {"id": 20,"comment": "Approach 4-4 high, back off high, give defender large corner in exchange for influence.","moves": ["15,15", "13,15", "15,13", "15,16", "16,16", "14,16", "16,17", "13,13"],"enabled": true}, {"id": 21,"comment": "Approach 4-4 high, back off high, trade corner potential for influence.","moves": ["15,3", "15,5", "13,3", "13,5"],"enabled": true}, {"id": 10,"comment": "Approach 4-4 low, back off, and settle calmly.","moves": ["3,3", "2,5", "5,2", "1,3", "2,2", "2,8"],"enabled": true}, {"id": 19,"comment": "Approach 4-4 low, back off, force defender to split corner, develop sides.","moves": ["3,3", "2,5", "5,2", "2,3", "2,2", "1,2", "2,4", "1,3", "3,4", "1,4", "2,1", "3,5"],"enabled": true}, {"id": 5,"comment": "Approach 4-4 low, back off, force defender to split the corner, and keep side low.","moves": ["3,3", "2,5", "5,2", "2,3", "2,2", "1,2", "2,4", "1,3", "3,4", "1,4", "3,5", "2,6"],"enabled": true}, {"id": 9,"comment": "Approach 4-4 low, get kicked, get side thickness.","moves": ["3,3", "2,5", "2,4", "3,5", "5,2", "3,9", "2,7", "3,7", "1,5", "1,6", "1,4", "2,6"],"enabled": true}, {"id": 18,"comment": "Approach 4-4 low, get kicked, settle.","moves": ["3,3", "2,5", "2,4", "3,5", "5,2", "3,9"],"enabled": true}, {"id": 8,"comment": "Enclose 3-4.","moves": ["3,2", "pass", "2,4"],"enabled": true}, {"id": 11,"comment": "Enclose 4-4.","moves": ["3,3", "pass", "2,5"],"enabled": true}, {"id": 26,"comment": "Fuseki: Chinese.","moves": ["15,3", "3,15", "15,16", "3,3", "16,10"],"enabled": true}, {"id": 25,"comment": "Fuseki: Sanrensei.","moves": ["3,3", "15,15", "15,3", "3,15", "9,3"],"enabled": true}, {"id": 6,"comment": "Invade 4-4, defender double-hanes to retain corner.","moves": ["3,3", "2,2", "2,3", "3,2", "4,2", "4,1", "5,1", "5,2", "4,3", "6,1", "3,1", "5,0", "2,1"],"enabled": true}, {"id": 22,"comment": "Invade 4-4, defender emphasizes side and sente.","moves": ["3,3", "2,2", "3,2", "2,3", "2,5", "2,4", "3,4", "1,5"],"enabled": true}, {"id": 13,"comment": "Invade 4-4, defender emphasizes side influence and sente.","moves": ["3,3", "2,2", "3,2", "2,3", "2,5", "1,5"],"enabled": true}, {"id": 23,"comment": "Invade 4-4, defender seals invader in with excellent influence.","moves": ["15,3", "16,2", "16,3", "15,2", "14,2", "14,1", "13,2", "13,1", "12,2", "17,3", "17,4", "17,2", "16,5"],"enabled": true}, {"id": 12,"comment": "Invade 4-4, defender trades some corner territory for sente.","moves": ["3,3", "2,2", "3,2", "2,3", "3,4", "1,5"],"enabled": true}, {"id": 24,"comment": "Invade 4-4, invader lives with sente.","moves": ["15,3", "16,2", "15,2", "16,3", "16,4", "17,4", "16,5", "17,5", "16,6", "17,6", "16,7"],"enabled": true}]}]};;
  const v2AutomaticStones = {"version":2,"groups":[{"name":"Existing Josekis","enabled":true,"josekis":[{"id":4,"comment":"Approach 3-4 high and settle facing in front of the 3-4.","moves":["3,2,false","3,4,false","2,4,false","2,5,false","2,3,false","3,5,false","5,2,false","3,9,false"],"enabled":true},{"id":17,"comment":"Approach 3-4 high, settle facing to the side of the 3-4.","moves":["3,2,false","3,4,false","2,4,false","3,3,false","2,3,false","4,2,false","2,2,false","3,5,false"],"enabled":true},{"id":7,"comment":"Approach 3-4 low, get kicked, and settle low.","moves":["3,2,false","2,4,false","2,3,false","3,4,false","5,2,false","2,8,false"],"enabled":true},{"id":14,"comment":"Approach 3-4 low, get kicked, settle high.","moves":["3,2,false","2,4,false","2,3,false","3,4,false","5,2,false","3,8,false"],"enabled":true},{"id":16,"comment":"Approach 3-4 low, make more fragile, faster extension.","moves":["16,3,false","14,2,false","15,5,false"],"enabled":true},{"id":15,"comment":"Approach 3-4 low, make solid, calm extension.","moves":["16,3,false","14,2,false","15,4,false"],"enabled":true},{"id":20,"comment":"Approach 4-4 high, back off high, give defender large corner in exchange for influence.","moves":["15,15,false","13,15,false","15,13,false","15,16,false","16,16,false","14,16,false","16,17,false","13,13,false"],"enabled":true},{"id":21,"comment":"Approach 4-4 high, back off high, trade corner potential for influence.","moves":["15,3,false","15,5,false","13,3,false","13,5,false"],"enabled":true},{"id":10,"comment":"Approach 4-4 low, back off, and settle calmly.","moves":["3,3,false","2,5,false","5,2,false","1,3,false","2,2,false","2,8,false"],"enabled":true},{"id":19,"comment":"Approach 4-4 low, back off, force defender to split corner, develop sides.","moves":["3,3,false","2,5,false","5,2,false","2,3,false","2,2,false","1,2,false","2,4,false","1,3,false","3,4,false","1,4,false","2,1,false","3,5,false"],"enabled":true},{"id":5,"comment":"Approach 4-4 low, back off, force defender to split the corner, and keep side low.","moves":["3,3,false","2,5,false","5,2,false","2,3,false","2,2,false","1,2,false","2,4,false","1,3,false","3,4,false","1,4,false","3,5,false","2,6,false"],"enabled":true},{"id":9,"comment":"Approach 4-4 low, get kicked, get side thickness.","moves":["3,3,false","2,5,false","2,4,false","3,5,false","5,2,false","3,9,false","2,7,false","3,7,false","1,5,false","1,6,false","1,4,false","2,6,false"],"enabled":true},{"id":18,"comment":"Approach 4-4 low, get kicked, settle.","moves":["3,3,false","2,5,false","2,4,false","3,5,false","5,2,false","3,9,false"],"enabled":true},{"id":8,"comment":"Enclose 3-4.","moves":["3,2,false","p,false","2,4,false"],"enabled":true},{"id":11,"comment":"Enclose 4-4.","moves":["3,3,false","p,false","2,5,false"],"enabled":true},{"id":26,"comment":"Fuseki: Chinese.","moves":["15,3,false","3,15,false","15,16,false","3,3,false","16,10,false"],"enabled":true},{"id":27,"comment":"Fuseki: Orthodox.","moves":["15,15,false","3,3,false","16,3,false","3,15,false","14,2,false"],"enabled":true},{"id":25,"comment":"Fuseki: Sanrensei.","moves":["3,3,false","15,15,false","15,3,false","3,15,false","9,3,false"],"enabled":true},{"id":6,"comment":"Invade 4-4, defender double-hanes to retain corner.","moves":["3,3,false","2,2,false","2,3,false","3,2,false","4,2,false","4,1,false","5,1,false","5,2,false","4,3,false","6,1,false","3,1,false","5,0,false","2,1,false"],"enabled":true},{"id":22,"comment":"Invade 4-4, defender emphasizes side and sente.","moves":["3,3,false","2,2,false","3,2,false","2,3,false","2,5,false","2,4,false","3,4,false","1,5,false"],"enabled":true},{"id":13,"comment":"Invade 4-4, defender emphasizes side influence and sente.","moves":["3,3,false","2,2,false","3,2,false","2,3,false","2,5,false","1,5,false"],"enabled":true},{"id":23,"comment":"Invade 4-4, defender seals invader in with excellent influence.","moves":["15,3,false","16,2,false","16,3,false","15,2,false","14,2,false","14,1,false","13,2,false","13,1,false","12,2,false","17,3,false","17,4,false","17,2,false","16,5,false"],"enabled":true},{"id":12,"comment":"Invade 4-4, defender trades some corner territory for sente.","moves":["3,3,false","2,2,false","3,2,false","2,3,false","3,4,false","1,5,false"],"enabled":true},{"id":24,"comment":"Invade 4-4, invader lives with sente.","moves":["15,3,false","16,2,false","15,2,false","16,3,false","16,4,false","17,4,false","16,5,false","17,5,false","16,6,false","17,6,false","16,7,false"],"enabled":true}]},{"name":"Setup Stone Examples","enabled":false,"josekis":[{"id":29,"comment":"3-3 Approach with Support\nIf you have support in the nearby corner, a pincer is a good option","moves":["3,15,true","p,true","16,16,true","13,16,true","10,16,false","15,15,false","16,15,false","15,13,false","16,14,false","13,13,false","7,16,false"],"enabled":true},{"id":28,"comment":"Eternal Life","moves":["0,17,true","0,15,true","0,16,true","1,15,true","1,16,true","2,15,true","2,16,true","3,15,true","3,16,true","4,15,true","4,16,true","5,15,true","4,17,true","5,16,true","5,17,true","6,17,true","6,18,true","7,17,true","3,18,true","3,17,true","p,true","2,17,true","p,true","1,17,true","p,true","1,18,true","p,true","5,18,true","2,18,false","4,18,false","3,18,false","5,18,false","2,18,false","4,18,false","3,18,false","5,18,false"],"enabled":true}]}],"userSettings":{"allowUnrestrictedAutoStones":false}};;

  const testData = [
      { name: 'original',               josekiData: originalJosekis}, 
      { name: 'v0 - enabled',           josekiData: v0enabledJosekis},
      { name: 'v1 - groups',            josekiData: v1GroupedJosekis},
      { name: 'v2 - automatic stones',  josekiData: v2AutomaticStones}
  ];

  function setupOnTestData(testFunc) {
    testData.forEach(function (testDatum) {
      var clonedData = structuredClone(testDatum);

      // Setup
      josekiData = clonedData.josekiData;

      testFunc(clonedData);
    })
  }

  describe('upgrades to v0', function () {
    it('ensures enabled property exists on each joseki', () => setupOnTestData(function (testData) {
      ensureBackwardsCompatibility();
      let jArray = getJosekiArray();

      assert.exists(jArray, testData.name);
      assert.isAtLeast(jArray.length, 1, testData.name);
      jArray.forEach((item, index) => {
        assert.property(item, 'enabled', `Object at index ${index} does not have the 'enabled' property in ${testData.name}`);
      });
    }));
  });

  describe('upgrades to v1 (Joseki Groups)', function () {
    it('ensures a version number is set', () => setupOnTestData(function (testData) {
      ensureBackwardsCompatibility();
      
      assert.exists(josekiData, testData.name);
      assert.property(josekiData, 'version', testData.name);
      assert.isAtLeast(josekiData.version, 1, testData.name);
    }));

    it('ensures joseki are in the groups property', () => setupOnTestData(function (testData) {
      ensureBackwardsCompatibility();
      
      assert.exists(josekiData, testData.name);
      assert.property(josekiData, 'groups', testData.name);
      assert.instanceOf(josekiData.groups, Array, testData.name);
      assert.isAtLeast(josekiData.groups.length, 1, testData.name);
    }));

    it('ensures joseki groups have names', () => setupOnTestData(function (testData) {
      ensureBackwardsCompatibility();
      
      josekiData.groups.forEach(function (group) {
        assert.exists(group, testData.name);
        assert.property(group, 'name', testData.name);
        assert.typeOf(group.name, 'string', testData.name);
        assert.isAtLeast(group.name.length, 1, testData.name)
      });
    }));

    it('ensures joseki groups have enabled property', () => setupOnTestData(function (testData) {
      ensureBackwardsCompatibility();
      
      josekiData.groups.forEach(function (group) {
        assert.exists(group, testData.name);
        assert.property(group, 'enabled', testData.name);
        assert.typeOf(group.enabled, 'boolean', testData.name);
      });
    }))
  });

  describe('upgrades to v2 (Setup Stones)', function (){
    it('ensures version number is at least 2', () => setupOnTestData(function (testData) {
      ensureBackwardsCompatibility();
      
      assert.isAtLeast(josekiData.version, 2, testData.name);
    }));

    it('sets a quiet user setting for more advanced capabilities', () => setupOnTestData(function (testData) {
      ensureBackwardsCompatibility();
      
      assert.nestedProperty(josekiData, 'userSettings.allowUnrestrictedAutoStones', testData.name);
    }))

    it('updates move serializing format', () => setupOnTestData(function (testData) {
      ensureBackwardsCompatibility();
      let josekiData = getJosekiArray();
      assert.isAtLeast(josekiData.length, 1, testData.name)

      const regex = /\d+,\d+,(true|false)/i;
      josekiData.forEach(function (joseki) {
        joseki.moves.forEach(function (move) {
          let isUpgraded = move === 'p,true' || move === 'p,false' || regex.test(move);
          assert.isTrue(isUpgraded, `move ${move} appears to be incorrectly formatted in joseki ${joseki.id}`, testData.name);
        })
      })
    }))
  });
});