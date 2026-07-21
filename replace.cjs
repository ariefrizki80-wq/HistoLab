const fs = require('fs');
let code = fs.readFileSync('src/components/StorytellingPresentation.tsx', 'utf8');

const startStr = "{/* RENDER BY SCENE TYPE */}";
const endStr = "</motion.div>";
const startIndex = code.indexOf(startStr);
const endIndex = code.lastIndexOf(endStr, code.indexOf("</AnimatePresence>"));

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = `
            <SlideRenderer
              scene={currentScene}
              material={activeMaterial}
              maps={activeMaterial.maps}
              timelineEvents={activeMaterial.timeline}
              mode="presentation"
              activeTimelineIndex={activeTimelineIndex}
              activeMapWalkIndex={activeMapWalkIndex}
              quizRevealed={quizRevealed}
              activeSubMaterialId={activeSubMaterialId}
              setActiveTimelineIndex={setActiveTimelineIndex}
              setMapWalkIndex={setMapWalkIndex}
              setQuizRevealed={setQuizRevealed}
              setActiveSubMaterialId={setActiveSubMaterialId}
            />
          `;
  const modified = code.substring(0, startIndex) + newContent + code.substring(endIndex);
  fs.writeFileSync('src/components/StorytellingPresentation.tsx', modified);
  console.log("Success");
} else {
  console.log("Failed to find start or end");
}
