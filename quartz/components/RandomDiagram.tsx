// @ts-ignore: this is safe
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types";
import randomdiagramsScript from "./scripts/randomdiagrams.inline";
import { classNames } from "../util/lang";

const RandomDiagram: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
        <div class={classNames(displayClass)} style="margin-left:auto">
            <img 
                id="random_diagram" 
                src='https://johnon.land/randomdiagrams/cube_light.svg'
                alt="cube"
                height="75px"
                width="75px"
                style="margin-top: 0; margin-bottom: 0"
            /> 
        </div>
    )
}

RandomDiagram.beforeDOMLoaded = randomdiagramsScript

export default (() => RandomDiagram) satisfies QuartzComponentConstructor