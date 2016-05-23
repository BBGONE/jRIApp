param($installPath, $toolsPath, $package, $project)
 
  # Need to load MSBuild assembly if it’s not loaded yet.
  Add-Type -AssemblyName 'Microsoft.Build, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
  # Grab the loaded MSBuild project for the project
  $msbuild = [Microsoft.Build.Evaluation.ProjectCollection]::GlobalProjectCollection.GetLoadedProjects($project.FullName) | Select-Object -First 1
  
  # remove the import
  $targetToRemove = $msbuild.Xml.Imports | Where-Object { $_.Project.Endswith('Microsoft.TypeScript.targets') }
  
  if ($targetToRemove){
    $msbuild.Xml.RemoveChild($targetToRemove) | out-null
  }
  
  # remove the props
  $propsToRemove = $msbuild.Xml.Imports | Where-Object { $_.Project.Endswith('Microsoft.TypeScript.Default.props') }
  if ($propsToRemove){
    $msbuild.Xml.RemoveChild($propsToRemove) | out-null
  }

  $nugetPropsToRemove = $msbuild.Xml.Imports | Where-Object { $_.Project.Endswith('Microsoft.TypeScript.NuGet.props') }
  if ($nugetPropsToRemove){
    $msbuild.Xml.RemoveChild($nugetPropsToRemove) | out-null
  }

  # save the project
  $project.Save()
 