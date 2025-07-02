// @ts-ignore: this is safe
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types";
import randomdiagramsScript from "./scripts/randomdiagrams.inline";
import physicsEasterEgg from "./scripts/physicseasteregg.inline";
import { classNames } from "../util/lang";

const RandomDiagram: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
        <div id="diagram-container" class={classNames(displayClass)} style="margin-left:auto;">
            <img 
                id="random_diagram" 
                src='https://johnon.land/randomdiagrams/cup.svg'
                alt="cup"
                height="60px"
                width="60px"
                style="margin-top: 0; margin-bottom: 0"
            /> 
        </div>
    )
}

RandomDiagram.beforeDOMLoaded = randomdiagramsScript
RandomDiagram.afterDOMLoaded = physicsEasterEgg

export default (() => RandomDiagram) satisfies QuartzComponentConstructor