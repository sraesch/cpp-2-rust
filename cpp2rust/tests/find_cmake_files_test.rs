#[cfg(test)]
mod test {
    use std::path::Path;

    use cpp2rust::cpp::{CMakeFileType, find_cmake_project_files};

    #[test]
    fn test_finding_cmake_files() {
        let root_folder = Path::new("test_data/finding_cmake_lists");
        let result = find_cmake_project_files(root_folder);
        assert!(result.is_ok());
        let cmake_files = result.unwrap();
        assert_eq!(cmake_files.len(), 3);

        assert_eq!(cmake_files[&0].id, 0);
        assert_eq!(cmake_files[&0].relative_path, Path::new("CMakeLists.txt"));
        assert_eq!(cmake_files[&0].cmake_file_type, CMakeFileType::CMakeLists);

        assert_eq!(cmake_files[&1].id, 1);
        assert_eq!(cmake_files[&1].relative_path, Path::new("a/CMakeLists.txt"));
        assert_eq!(cmake_files[&1].cmake_file_type, CMakeFileType::CMakeLists);

        assert_eq!(cmake_files[&2].id, 2);
        assert_eq!(
            cmake_files[&2].relative_path,
            Path::new("c/d/CMakeLists.txt")
        );
        assert_eq!(cmake_files[&2].cmake_file_type, CMakeFileType::CMakeLists);
    }
}
