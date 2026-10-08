import httpx

client = httpx.Client(base_url="http://127.0.0.1:8000")

print("--- 1. Testing Health ---")
res = client.get("/")
print("Root status:", res.status_code, res.json())

print("\n--- 2. Testing Safety Guardrails (Agent 5) ---")
res = client.post("/api/safety/check-query", json={"query": "Can I stop taking Clopidogrel because of bruising?"})
data = res.json()
print("Safety evaluation:", {
    "is_sensitive": data["is_sensitive"],
    "requires_escalation": data["requires_escalation"],
    "category": data["category"],
    "recommended_action": data["recommended_action"][:80] + "..."
})

print("\n--- 3. Testing Task Status Update ---")
res = client.put("/api/tasks/task-1/status", json={"status": "Completed"})
print("Updated Task-1 status:", res.status_code, res.json()["status"])

print("\n--- 4. Testing Providers (Agent 6) ---")
res = client.get("/api/providers?specialty=Cardiology")
provs = res.json()
print(f"Found {len(provs)} cardiology providers:")
for p in provs[:2]:
    print(f"  - {p['name']} | {p['specialty']} | {p['facility']} ({p['location']})")

print("\n--- 5. Testing Scenario 3 Analyze (Ambiguous Instructions) ---")
res = client.post("/api/discharge/analyze", json={"scenario_id": "scenario_3", "raw_text": ""})
scen3 = res.json()
print(f"Scenario 3 analysis completed:")
print(f"  - Total tasks: {len(scen3['tasks'])}")
print(f"  - Reviews flagged: {len(scen3['reviews'])}")
for r in scen3['reviews']:
    print(f"    * [{r['priority']} Priority] {r['issue']}: {r['reason'][:70]}...")

print("\n--- 6. Testing Scenario 4 Analyze (Conflicting Instructions) ---")
res = client.post("/api/discharge/analyze", json={"scenario_id": "scenario_4", "raw_text": ""})
scen4 = res.json()
print(f"Scenario 4 analysis completed:")
print(f"  - Reviews flagged: {len(scen4['reviews'])}")
for r in scen4['reviews']:
    print(f"    * [{r['priority']} Priority] {r['issue']}")

print("\n--- 7. Testing Scenario 5 Analyze (Clinically Sensitive Note) ---")
res = client.post("/api/discharge/analyze", json={"scenario_id": "scenario_5", "raw_text": ""})
scen5 = res.json()
print(f"Scenario 5 analysis completed:")
print(f"  - Reviews flagged: {len(scen5['reviews'])}")
for r in scen5['reviews']:
    print(f"    * [{r['priority']} Priority] {r['issue']}")

print("\nALL BACKEND API TESTS COMPLETED SUCCESSFULLY!")
