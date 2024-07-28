SELECT setval('"Card_cid_seq"', (SELECT MAX(cid) FROM "Card") + 1);
SELECT setval('"Note_nid_seq"', (SELECT MAX(nid) FROM "Note") + 1);
SELECT setval('"parameters_uid_seq"', (SELECT MAX(uid) FROM "Parameters") + 1);
SELECT setval('"User_uid_seq"', (SELECT MAX(uid) FROM "User") + 1);