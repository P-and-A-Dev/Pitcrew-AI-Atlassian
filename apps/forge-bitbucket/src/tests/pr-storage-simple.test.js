/**
 * Simplified PR Storage Tests (Made By AI)
 * Tests the logic without actual Forge storage
 * Run with: node src/tests/pr-storage-simple.test.js
 */

const mockStorage = new Map();

function buildPrKey(workspaceUuid, repoUuid, prId) {
    return `PR:${workspaceUuid}:${repoUuid}:${prId}`;
}

function buildIndexKey(indexType, workspaceUuid, repoUuid, suffix) {
    const base = `PR_INDEX:${indexType}:${workspaceUuid}:${repoUuid}`;
    return suffix ? `${base}:${suffix}` : base;
}

async function addToIndex(indexKey, prKey) {
    const index = mockStorage.get(indexKey) || [];
    if (!index.includes(prKey)) {
        index.push(prKey);
        mockStorage.set(indexKey, index);
    }
}

async function removeFromIndex(indexKey, prKey) {
    const index = mockStorage.get(indexKey) || [];
    const filtered = index.filter(k => k !== prKey);
    if (filtered.length !== index.length) {
        mockStorage.set(indexKey, filtered);
    }
}

async function saveMockPr(pr) {
    const prKey = buildPrKey(pr.workspaceUuid, pr.repoUuid, pr.prId);

    const existing = mockStorage.get(prKey);

    mockStorage.set(prKey, { ...pr });

    await addToIndex(buildIndexKey("byRepo", pr.workspaceUuid, pr.repoUuid), prKey);

    if (pr.state === "OPEN") {
        await addToIndex(buildIndexKey("open", pr.workspaceUuid, pr.repoUuid), prKey);
    } else {
        await removeFromIndex(buildIndexKey("open", pr.workspaceUuid, pr.repoUuid), prKey);
    }

    const oldColor = existing?.riskColor;
    const newColor = pr.riskColor;

    if (oldColor !== newColor) {
        if (oldColor) {
            await removeFromIndex(buildIndexKey("byRisk", pr.workspaceUuid, pr.repoUuid, oldColor), prKey);
        }
        await addToIndex(buildIndexKey("byRisk", pr.workspaceUuid, pr.repoUuid, newColor), prKey);
    } else if (!existing) {
        await addToIndex(buildIndexKey("byRisk", pr.workspaceUuid, pr.repoUuid, newColor), prKey);
    }
}

async function test1_saveNewPr() {
    console.log("🧪 Test 1: Save new PR -> index byRepo contains the key");

    mockStorage.clear();

    const mockPr = {
        workspaceUuid: "workspace-123",
        repoUuid: "repo-456",
        prId: 1,
        title: "Test PR",
        state: "OPEN",
        riskColor: "yellow",
        riskScore: 75,
    };

    await saveMockPr(mockPr);

    const prKey = buildPrKey("workspace-123", "repo-456", 1);
    const storedPr = mockStorage.get(prKey);

    if (!storedPr) {
        console.error("❌ FAILED: PR not saved");
        return false;
    }

    const byRepoIndex = mockStorage.get(buildIndexKey("byRepo", "workspace-123", "repo-456"));
    if (!byRepoIndex || !byRepoIndex.includes(prKey)) {
        console.error("❌ FAILED: PR not in byRepo index");
        return false;
    }

    const openIndex = mockStorage.get(buildIndexKey("open", "workspace-123", "repo-456"));
    if (!openIndex || !openIndex.includes(prKey)) {
        console.error("❌ FAILED: PR not in open index");
        return false;
    }

    const yellowIndex = mockStorage.get(buildIndexKey("byRisk", "workspace-123", "repo-456", "yellow"));
    if (!yellowIndex || !yellowIndex.includes(prKey)) {
        console.error("❌ FAILED: PR not in yellow risk index");
        return false;
    }

    console.log("✅ PASSED: PR saved and indexed correctly");
    return true;
}

async function test2_updateSamePr() {
    console.log("🧪 Test 2: Update same PR -> no duplication in index");

    mockStorage.clear();

    const mockPr = {
        workspaceUuid: "workspace-123",
        repoUuid: "repo-456",
        prId: 1,
        title: "Test PR",
        state: "OPEN",
        riskColor: "yellow",
        riskScore: 75,
    };

    await saveMockPr(mockPr);
    await saveMockPr(mockPr);

    const prKey = buildPrKey("workspace-123", "repo-456", 1);
    const byRepoIndex = mockStorage.get(buildIndexKey("byRepo", "workspace-123", "repo-456"));
    const count = byRepoIndex.filter(k => k === prKey).length;

    if (count !== 1) {
        console.error(`❌ FAILED: Found ${count} duplicates in byRepo index`);
        return false;
    }

    console.log("✅ PASSED: No duplicates in indexes");
    return true;
}

async function test3_riskChangeUpdatesIndexes() {
    console.log("🧪 Test 3: Risk change green -> red -> index green removes, red adds");

    mockStorage.clear();

    const mockPr1 = {
        workspaceUuid: "workspace-123",
        repoUuid: "repo-456",
        prId: 1,
        title: "Test PR",
        state: "OPEN",
        riskColor: "green",
        riskScore: 90,
    };

    await saveMockPr(mockPr1);

    const prKey = buildPrKey("workspace-123", "repo-456", 1);

    let greenIndex = mockStorage.get(buildIndexKey("byRisk", "workspace-123", "repo-456", "green"));
    if (!greenIndex || !greenIndex.includes(prKey)) {
        console.error("❌ FAILED: PR not in green index initially");
        return false;
    }

    const mockPr2 = {
        workspaceUuid: "workspace-123",
        repoUuid: "repo-456",
        prId: 1,
        title: "Test PR",
        state: "OPEN",
        riskColor: "red",
        riskScore: 30,
    };
    await saveMockPr(mockPr2);

    greenIndex = mockStorage.get(buildIndexKey("byRisk", "workspace-123", "repo-456", "green"));
    if (greenIndex && greenIndex.includes(prKey)) {
        console.error("❌ FAILED: PR still in green index after change to red");
        return false;
    }

    const redIndex = mockStorage.get(buildIndexKey("byRisk", "workspace-123", "repo-456", "red"));
    if (!redIndex || !redIndex.includes(prKey)) {
        console.error("❌ FAILED: PR not in red index after change");
        return false;
    }

    console.log("✅ PASSED: Risk indexes updated correctly");
    return true;
}

async function test4_stateChangeShouldUpdateOpenIndex() {
    console.log("🧪 Test 4: State change OPEN -> MERGED -> open index removes");

    mockStorage.clear();

    const mockPr1 = {
        workspaceUuid: "workspace-123",
        repoUuid: "repo-456",
        prId: 1,
        title: "Test PR",
        state: "OPEN",
        riskColor: "green",
        riskScore: 85,
    };

    await saveMockPr(mockPr1);

    const prKey = buildPrKey("workspace-123", "repo-456", 1);

    let openIndex = mockStorage.get(buildIndexKey("open", "workspace-123", "repo-456"));
    if (!openIndex || !openIndex.includes(prKey)) {
        console.error("❌ FAILED: PR not in open index initially");
        return false;
    }

    const mockPr2 = {
        workspaceUuid: "workspace-123",
        repoUuid: "repo-456",
        prId: 1,
        title: "Test PR",
        state: "MERGED",
        riskColor: "green",
        riskScore: 85,
    };
    await saveMockPr(mockPr2);

    openIndex = mockStorage.get(buildIndexKey("open", "workspace-123", "repo-456"));
    if (openIndex && openIndex.includes(prKey)) {
        console.error("❌ FAILED: PR still in open index after MERGED");
        return false;
    }

    console.log("✅ PASSED: Open index updated correctly on state change");
    return true;
}

async function runTests() {
    console.log("\n🚀 Starting PR Storage Tests (Simplified)\n");

    const results = [
        await test1_saveNewPr(),
        await test2_updateSamePr(),
        await test3_riskChangeUpdatesIndexes(),
        await test4_stateChangeShouldUpdateOpenIndex(),
    ];

    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log(`\n📊 Test Results: ${passed}/${total} passed\n`);

    if (passed === total) {
        console.log("✅ All tests passed!");
    } else {
        console.log(`❌ ${total - passed} test(s) failed`);
    }
}

runTests();
