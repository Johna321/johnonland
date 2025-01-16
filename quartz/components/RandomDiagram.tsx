// @ts-ignore: this is safe
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types";
import randomdiagramsScript from "./scripts/randomdiagrams.inline";
import { classNames } from "../util/lang";

const RandomDiagram: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
        <div class={classNames(displayClass)}>
            <img 
                id="random_diagram" 
                src="https://johnon.land/randomdiagrams/cube_light.svg" 
                alt="cube"
                width="75px"
                height="100%"
            /> 
        </div>
    )
}

RandomDiagram.beforeDOMLoaded = randomdiagramsScript

export default (() => RandomDiagram) satisfies QuartzComponentConstructor