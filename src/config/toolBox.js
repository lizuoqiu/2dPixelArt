import React from "react";
import { MdCropDin } from "react-icons/md";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { BiIntersect } from "react-icons/bi";
import { BsSubtract } from "react-icons/bs";
import { ImPencil } from "react-icons/im";
import {
  modifyAddSelection,
  modifyIntersectSelection,
  modifySingleSelection,
  modifySubtractSelection
} from "utils/toolBoxUtils";

export const SelectionBox = {
  singleSelection: {
    name: "Polygon Selection",
    icon: <MdCropDin />,
    tooltip: "polygon selection tool",
    type: "boundingBox",
    text: "Selected",
    func: modifySingleSelection
  }
  //   name: "Multiple Selection",
  //   icon: <RiCheckboxMultipleBlankLine />,
  //   tooltip: "multiple",
  //   type: "boundingBox",
  //   text: "Add",
  //   func: modifyAddSelection
  // },
  // subtractSelection: {
  //   name: "Subtract Selection",
  //   icon: <BsSubtract />,
  //   tooltip: "subtract",
  //   type: "boundingBox",
  //   text: "Subtract",
  //   func: modifySubtractSelection
  // },
  // intersectSelection: {
  //   name: "Intersection Selection",
  //   icon: <BiIntersect />,
  //   tooltip: "intersection",
  //   type: "boundingBox",
  //   text: "Intersect",
  //   func: modifyIntersectSelection
  // } addSelection: {

  // scribbleTool: {
  //   name: "Scribble",
  //   icon: <ImPencil />,
  //   tooltip: "scribble",
  //   type: "scribble",
  //   text: "Scribble",
  //   func: null
  // }
};
